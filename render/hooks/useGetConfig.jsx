import React, { useEffect, useState } from "react";

export default function useGetConfig(path) {
  const [configValue, setConfigValue] = useState(null);

  useEffect(() => {
    config.get(path).then((result) => {
      setConfigValue(result);
    });
  }, []);

  return [configValue];
}
