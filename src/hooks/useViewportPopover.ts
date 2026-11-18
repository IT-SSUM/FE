import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const VIEWPORT_GAP = 12;
const POPOVER_GAP = 8;

const HIDDEN_POPOVER_STYLE: CSSProperties = {
  position: "fixed",
  visibility: "hidden",
};

type PopoverPlacement = "auto" | "bottom";

type UseViewportPopoverOptions = {
  placement?: PopoverPlacement;
  lockPlacement?: boolean;
  ignoreInternalScroll?: boolean;
};

export function useViewportPopover<T extends HTMLElement>(
  open: boolean,
  preferredHeight: number,
  options?: UseViewportPopoverOptions,
) {
  const anchorRef = useRef<T>(null);
  const placementRef = useRef<"above" | "below" | null>(null);

  const [popoverStyle, setPopoverStyle] =
    useState<CSSProperties>(HIDDEN_POPOVER_STYLE);

  const placement = options?.placement ?? "auto";
  const lockPlacement = options?.lockPlacement ?? false;
  const ignoreInternalScroll = options?.ignoreInternalScroll ?? false;

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();

    const availableBelow =
      window.innerHeight - rect.bottom - VIEWPORT_GAP - POPOVER_GAP;

    const availableAbove = rect.top - VIEWPORT_GAP - POPOVER_GAP;

    let placeBelow: boolean;

    if (lockPlacement && placementRef.current) {
      placeBelow = placementRef.current === "below";
    } else if (placement === "bottom") {
      placeBelow = true;
    } else {
      placeBelow =
        availableBelow >= preferredHeight || availableBelow >= availableAbove;
    }

    if (lockPlacement && !placementRef.current) {
      placementRef.current = placeBelow ? "below" : "above";
    }

    const width = Math.min(rect.width, window.innerWidth - VIEWPORT_GAP * 2);

    const left = Math.min(
      Math.max(rect.left, VIEWPORT_GAP),
      window.innerWidth - width - VIEWPORT_GAP,
    );

    const availableHeight = Math.max(
      0,
      placeBelow ? availableBelow : availableAbove,
    );

    setPopoverStyle({
      position: "fixed",
      left,
      width,
      maxHeight: availableHeight,
      visibility: "visible",

      ...(placeBelow
        ? {
            top: rect.bottom + POPOVER_GAP,
            bottom: "auto",
          }
        : {
            top: "auto",
            bottom: window.innerHeight - rect.top + POPOVER_GAP,
          }),
    });
  }, [lockPlacement, placement, preferredHeight]);

  const handleScroll = useCallback(
    (event: Event) => {
      if (ignoreInternalScroll) {
        const anchor = anchorRef.current;

        const target = event.target;

        if (anchor && target instanceof Node && anchor.contains(target)) {
          return;
        }
      }

      updatePosition();
    },
    [ignoreInternalScroll, updatePosition],
  );

  useLayoutEffect(() => {
    if (!open) {
      placementRef.current = null;

      setPopoverStyle(HIDDEN_POPOVER_STYLE);

      return;
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", updatePosition);

      window.removeEventListener("scroll", handleScroll, true);

      placementRef.current = null;
    };
  }, [handleScroll, open, updatePosition]);

  return {
    anchorRef,
    popoverStyle,
  };
}
