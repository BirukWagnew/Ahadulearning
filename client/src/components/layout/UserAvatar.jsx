import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media";

const UserAvatar = ({ getUserInitials, className, src, alt }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const resolvedSrc = resolveMediaUrl(src, API_BASE_URL) || "";

  useEffect(() => {
    setImgFailed(false);
  }, [resolvedSrc]);

  return (
    <Button
      variant="ghost"
      className={`relative h-24 w-24 rounded-full ${className || ""}`}
      size="icon"
    >
      <Avatar className="h-24 w-24">
        {resolvedSrc && !imgFailed ? (
          <AvatarImage
            src={resolvedSrc}
            alt={alt || "User avatar"}
            onError={() => setImgFailed(true)}
          />
        ) : null}
        <AvatarFallback className="bg-fidel-100 text-fidel-700 dark:bg-fidel-900 dark:text-fidel-300 text-4xl font-bold">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
    </Button>
  );
};

export default UserAvatar;
