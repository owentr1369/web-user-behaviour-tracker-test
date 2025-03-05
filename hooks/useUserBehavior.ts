import { useState, useEffect, useCallback } from "react";

// TypeScript interfaces for type safety
interface UserInfo {
  appCodeName: string;
  appName: string;
  vendor: string;
  platform: string;
  userAgent: string;
}

interface TimeTracking {
  totalTime: number;
  timeOnPage: number;
}

interface ClickDetails {
  timestamp: number;
  node: string;
  x: number;
  y: number;
}

interface MouseMovement {
  timestamp: number;
  x: number;
  y: number;
}

interface ContextChange {
  timestamp: number;
  type: string;
}

interface KeyLogEntry {
  timestamp: number;
  data: string;
  type: "paste" | "keypress";
}

interface UserBehaviorResults {
  userInfo: UserInfo;
  time: TimeTracking;
  clicks: {
    clickCount: number;
    clickDetails: ClickDetails[];
  };
  mouseMovements: MouseMovement[];
  contextChange: ContextChange[];
  keyLogger: KeyLogEntry[];
}

interface UserBehaviorOptions {
  clickCount?: boolean;
  clickDetails?: boolean;
  mouseMovement?: boolean;
  context?: boolean;
  keyLogger?: boolean;
  processTime?: number;
  processData?: (results: UserBehaviorResults) => void;
  actionItem?: {
    processOnAction?: boolean;
    selector?: string;
    event?: string;
  };
}

export const useUserBehavior = (options?: UserBehaviorOptions) => {
  // Default options
  const defaultOptions: UserBehaviorOptions = {
    clickCount: true,
    clickDetails: true,
    mouseMovement: true,
    context: true,
    keyLogger: true,
    processTime: 15,
    processData: (results) => console.log(results),
    actionItem: {
      processOnAction: false,
      selector: "",
      event: "",
    },
  };

  // Merge provided options with defaults
  const settings = { ...defaultOptions, ...options };

  // Initial state for tracking results
  const [results, setResults] = useState<UserBehaviorResults>({
    userInfo: {
      appCodeName: navigator.appCodeName || "",
      appName: navigator.appName || "",
      vendor: navigator.vendor || "",
      platform: navigator.platform || "",
      userAgent: navigator.userAgent || "",
    },
    time: {
      totalTime: 0,
      timeOnPage: 0,
    },
    clicks: {
      clickCount: 0,
      clickDetails: [],
    },
    mouseMovements: [],
    contextChange: [],
    keyLogger: [],
  });

  // Process results method
  const processResults = useCallback(() => {
    if (settings.processData) {
      settings.processData(results);
    }
  }, [results, settings]);

  // Effect for tracking user behavior
  useEffect(() => {
    // Check for browser support
    if (!document.querySelector || !document.addEventListener) return;

    // Timer interval
    const timerInterval = setInterval(() => {
      setResults((prevResults) => ({
        ...prevResults,
        time: {
          ...prevResults.time,
          totalTime: prevResults.time.totalTime + 1,
          timeOnPage:
            document.visibilityState === "visible"
              ? prevResults.time.timeOnPage + 1
              : prevResults.time.timeOnPage,
        },
      }));

      // Process results at specified interval
      setResults((prevResults) => {
        if (
          settings.processTime &&
          prevResults.time.totalTime > 0 &&
          prevResults.time.totalTime % settings.processTime === 0
        ) {
          processResults();
        }
        return prevResults;
      });
    }, 1000);

    // Click tracking
    const handleMouseUp = (event: MouseEvent) => {
      if (settings.clickCount || settings.clickDetails) {
        setResults((prevResults) => ({
          ...prevResults,
          clicks: {
            clickCount: settings.clickCount
              ? prevResults.clicks.clickCount + 1
              : prevResults.clicks.clickCount,
            clickDetails: settings.clickDetails
              ? [
                  ...prevResults.clicks.clickDetails,
                  {
                    timestamp: Date.now(),
                    node: (event.target as HTMLElement).outerHTML,
                    x: event.pageX,
                    y: event.pageY,
                  },
                ]
              : prevResults.clicks.clickDetails,
          },
        }));
      }
    };

    // Mouse movement tracking
    const handleMouseMove = (event: MouseEvent) => {
      if (settings.mouseMovement) {
        setResults((prevResults) => ({
          ...prevResults,
          mouseMovements: [
            ...prevResults.mouseMovements,
            {
              timestamp: Date.now(),
              x: event.pageX,
              y: event.pageY,
            },
          ],
        }));
      }
    };

    // Context change tracking
    const handleVisibilityChange = () => {
      if (settings.context) {
        setResults((prevResults) => ({
          ...prevResults,
          contextChange: [
            ...prevResults.contextChange,
            {
              timestamp: Date.now(),
              type: document.visibilityState,
            },
          ],
        }));
      }
    };

    // Key logging
    const handlePaste = (event: ClipboardEvent) => {
      if (settings.keyLogger) {
        const pastedText = (
          event.clipboardData || (window as any).clipboardData
        )?.getData("text/plain");

        if (pastedText) {
          setResults((prevResults) => ({
            ...prevResults,
            keyLogger: [
              ...prevResults.keyLogger,
              {
                timestamp: Date.now(),
                data: pastedText,
                type: "paste",
              },
            ],
          }));
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (settings.keyLogger) {
        const charString = String.fromCharCode(event.keyCode || event.which);

        setResults((prevResults) => ({
          ...prevResults,
          keyLogger: [
            ...prevResults.keyLogger,
            {
              timestamp: Date.now(),
              data: charString,
              type: "keypress",
            },
          ],
        }));
      }
    };

    // Add event listeners
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keyup", handleKeyUp);

    // Handle specific action item if provided
    if (settings.actionItem?.processOnAction && settings.actionItem.selector) {
      const node = document.querySelector(settings.actionItem.selector);
      if (node && settings.actionItem.event) {
        const handleActionItem = () => processResults();
        node.addEventListener(settings.actionItem.event, handleActionItem);

        // Cleanup for this specific listener
        return () => {
          node.removeEventListener(
            (settings as any).actionItem.event,
            handleActionItem
          );
        };
      }
    }

    // Cleanup function
    return () => {
      clearInterval(timerInterval);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [settings, processResults]);

  // Return results and processing method
  return {
    results,
    processResults,
  };
};
