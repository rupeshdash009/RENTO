export const DATA_REFRESH_EVENT = "rento-data-refresh";

export const triggerDataRefresh = () => {
  window.dispatchEvent(new Event(DATA_REFRESH_EVENT));
};

export const subscribeDataRefresh = (callback) => {
  window.addEventListener(DATA_REFRESH_EVENT, callback);

  return () => {
    window.removeEventListener(DATA_REFRESH_EVENT, callback);
  };
};
