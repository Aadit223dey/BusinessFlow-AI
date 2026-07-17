"use client";

import { useState, useCallback } from "react";

/**
 * State manager for Drawers and Modals.
 *
 * Provides a simple open/close/toggle state interface for
 * controlling visibility of overlay components.
 *
 * @example
 * ```tsx
 * const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
 *
 * return (
 *   <>
 *     <Button onClick={onOpen}>Open Drawer</Button>
 *     <Drawer isOpen={isOpen} onClose={onClose} title="Settings">
 *       <p>Drawer content</p>
 *     </Drawer>
 *   </>
 * );
 * ```
 */

export interface UseDisclosureReturn {
  /** Current open state */
  isOpen: boolean;
  /** Open the component */
  onOpen: () => void;
  /** Close the component */
  onClose: () => void;
  /** Toggle between open and closed states */
  onToggle: () => void;
}

export function useDisclosure(
  initialState: boolean = false
): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, onOpen, onClose, onToggle };
}
