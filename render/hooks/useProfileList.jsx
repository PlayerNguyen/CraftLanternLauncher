import { useEffect, useState } from "react";

/**
 *
 * @returns {any[]} profile list
 */
export default function useProfileList() {
  const [profileList, setProfileList] = useState(null);
  useEffect(() => {
    profile.getProfileList().then((response) => {
      setProfileList(response);
    });
  }, []);
  return profileList;
}
