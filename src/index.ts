import type { Color, DrawingType, Repetition, ColorStop, LineStyle, Point, Shadow, Dimensions, Scale, TextStyle, Dash, Rectangle } from './properties';
import { DefaultLineStyle, DefaultShadow } from './properties';
import { Mgine } from './mgine';
import { DrawingError, PathError } from './errors';
import type { Curve, Line, BezierCurve, QuadraticCurve, SegmentType } from './path';
import { Path, Segment } from './path';
import { deepClone } from './utils';

export default Mgine;
export type { Color, DrawingType, Repetition, ColorStop, LineStyle, Point, Shadow, Dimensions, Scale, TextStyle, Dash, Rectangle };
export { DefaultLineStyle, DefaultShadow };
export type { Curve, Line, BezierCurve, QuadraticCurve, SegmentType };
export { Path, Segment };
export { DrawingError, PathError };
export { deepClone };
