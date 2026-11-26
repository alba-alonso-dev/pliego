export { Book } from './components/Book'
export { SPINE_GAP } from './components/Leaf'
export type { BookProps } from './components/Book'
export { BookArrows } from './components/BookArrows'
export type { BookArrowsProps } from './components/BookArrows'
export type { NavigationOptions } from './components/useBookNavigation'
export { DEFAULT_PAPER_DEPTH, DEFAULT_ROUGH_EDGES, Paper } from './components/Paper'
export { hashSeed, roughenContour, roughenOutlines, seededRandom } from './math/rough-edges'
export type { RoughOptions } from './math/rough-edges'
export type { PaperProps } from './components/Paper'
export { bounds, fitOutlines, outlinesFromSvg, shapeFromOutline } from './paper/outline'
export type { Anchor, FitOptions, Outline, Point } from './paper/outline'
export { EDGE_CORE, PAPER_CORE, paperGrain, paperMaterials } from './materials/paper'
export type { PaperMaterials } from './materials/paper'
export { PaperLights } from './components/PaperLights'
export type { PaperLightsProps } from './components/PaperLights'
export { DEFAULT_PARALLAX, PliegoCanvas } from './components/PliegoCanvas'
export { PaperEffects } from './components/PaperEffects'
export type { PaperEffectsProps } from './components/PaperEffects'
export { Table } from './components/Table'
export type { TableProps } from './components/Table'
export { woodPixels } from './materials/wood'
export type { WoodOptions } from './materials/wood'
export { damping, parallaxOffset, tiltToPointer } from './math/parallax'
export type { PliegoCanvasProps } from './components/PliegoCanvas'
export { HandDrawn, INK_LIFT } from './components/HandDrawn'
export type { HandDrawnProps } from './components/HandDrawn'
export { fitStrokes, pickSource, resample, strokeLength, strokesFromSvg } from './paper/strokes'
export type { HandDrawnSource, Stroke } from './paper/strokes'
export { OnPage } from './components/OnPage'
export type { OnPageProps } from './components/OnPage'
export { PrintedLayer } from './components/PrintedLayer'
export type { PrintedLayerProps } from './components/PrintedLayer'
export { layerShift } from './math/printed'
export { useParallaxPointer } from './components/useParallaxPointer'
export { ParallelFold } from './components/ParallelFold'
export type { ParallelFoldProps } from './components/ParallelFold'
export {
  FoldFrame,
  MechanismPartsContext,
  MechanismRoot,
  OnPanel,
  PanelFrame,
  useFoldSupport,
  Valley,
} from './components/FoldSupport'
export type {
  FoldFrameProps,
  FoldSupport,
  MechanismParts,
  PanelPose,
} from './components/FoldSupport'
export { supportFrame } from './math/layers'
export type { SupportFrame, SupportPose } from './math/layers'
export { DEFAULT_TAB, FoldPanel } from './components/FoldPanel'
export type { FoldPanelProps } from './components/FoldPanel'
export {
  bisector,
  circleIntersection,
  isFoldable,
  leftSupport,
  parallelFold,
  stepFold,
  tentFold,
} from './math/parallel-fold'
export type { ParallelFoldPose, ParallelFoldSpec, Vec2 } from './math/parallel-fold'
export { FloatingLayer } from './components/FloatingLayer'
export type { FloatingLayerProps } from './components/FloatingLayer'
export { floatingLayer } from './math/floating-layer'
export type { FloatingLayerPose } from './math/floating-layer'
export { VFold } from './components/VFold'
export type { VFoldProps } from './components/VFold'
export { panelRise, vFold, vFoldLean, vFoldRises, vFoldValleys } from './math/v-fold'
export type { ValleyPose, Vec3, VFoldPose } from './math/v-fold'
export { useGesture } from './components/useGesture'
export type { Gesture, GestureOptions } from './components/useGesture'
export { approach, dragProgress, holdStep } from './math/gesture'
export { isGestureLocked, lockGesture, unlockGesture } from './gesture-lock'
export { Flap, Linked, PullTab, useMovable, Volvelle } from './components/Movables'
export type { FlapProps, LinkedProps, PullTabProps, VolvelleProps } from './components/Movables'
export { MovableControls } from './components/MovableControls'
export type { MovableControlsProps } from './components/MovableControls'
export { useMovablesStore } from './movables-store'
export type { MovableEntry } from './movables-store'
export { linkedProgress, sectorOutline } from './math/movables'
export { curlAmount, curlColumns, MAX_CURL } from './math/curl'
export { LanguageSwitcher, Languages, useI18nStore, useT, useTexts } from './i18n/Languages'
export type { LanguageSwitcherProps, LanguagesProps } from './i18n/Languages'
export { baseLang, resolveLang, translate } from './i18n/resolve'
export type { Dictionary, LangSources } from './i18n/resolve'
export { PageText } from './components/PageText'
export type { PageTextProps } from './components/PageText'
export { LoadingScreen } from './components/LoadingScreen'
export type { LoadingScreenProps } from './components/LoadingScreen'
export { Bob, Spin, Sway } from './components/Ambient'
export type { BobProps, SpinProps, SwayProps } from './components/Ambient'
export { bobOffset, spinAngle, swayAngle } from './math/ambient'
export { PopUp } from './components/PopUp'
export type { PopUpProps } from './components/PopUp'
export { Spread, useSpread, useSpreadTheta } from './components/Spread'
export type { SpreadInfo, SpreadProps } from './components/Spread'
export { clamp, easeInOutCubic, easeInOutSine, easeOutCubic, lerp } from './math/easing'
export { depthDelay, elevation, MAX_DEPTH_DELAY, pivotRotationX, unfoldProgress } from './math/fold'
export { idForPage, pageForId, useBook, useBookStore } from './store'
export { DEFAULT_REVEAL, revealProgress, visibleSegments } from './math/reveal'
export type { RevealTiming } from './math/reveal'
export { prefersReducedMotion } from './motion'
export type { BookState } from './store'
