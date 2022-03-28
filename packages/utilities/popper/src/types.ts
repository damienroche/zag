import type { Boundary, Placement, ComputePositionReturn } from "@floating-ui/dom"
import { AutoUpdateOptions } from "./auto-update"

export type { Placement }

export type PositioningOptions = {
  /**
   * The strategy to use for positioning
   */
  strategy?: "absolute" | "fixed"
  /**
   * The initial placement of the floating element
   */
  placement?: Placement
  /**
   * The offset of the floating element
   */
  offset?: { mainAxis?: number; crossAxis?: number }
  /**
   * The main axis offset or gap between the reference and floating elements
   */
  gutter?: number
  /**
   * Whether to flip the placement
   */
  flip?: boolean
  /**
   * Whether to make the floating element same width as the reference element
   */
  sameWidth?: boolean
  /**
   * The overflow boundary of the reference element
   */
  boundary?: Boundary
  /**
   * Options to activate auto-update listeners
   */
  listeners?: boolean | AutoUpdateOptions
  /**
   * Function called when the placement is computed
   */
  onComplete?(data: ComputePositionReturn): void
  /**
   * Function called on cleanup of all listeners
   */
  onCleanup?: VoidFunction
}