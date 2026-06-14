import { useEffect } from "react";
import { subscribeDataRefresh } from "../utils/dataRefresh";

function useAutoRefresh(callback, interval = 30000) {
  useEffect(() => {
    if (typeof callback !== "function") return undefined;

    callback();

    const intervalId = setInterval(() => {
      callback();
    }, interval);

    const unsubscribe = subscribeDataRefresh(callback);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [callback, interval]);
}

export default useAutoRefresh;
