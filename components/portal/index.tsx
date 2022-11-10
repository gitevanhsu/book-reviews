import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!elRef.current) elRef.current = document.querySelector("#myportal");
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, elRef.current!) : null;
};

export default Portal;
