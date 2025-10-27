import { Color, ColorStop, DefaultLineStyle, DefaultShadow, LineStyle, Point, Repetition, Shadow, Dimensions, Scale, TextStyle } from './properties';
import { Mgine } from './mgine';
import { DrawingError, PathError } from './errors';
import { Path, Segment, Curve, Line } from './path';
import { deepClone } from './utils';

export default Mgine;
export { Color, ColorStop, DefaultLineStyle, DefaultShadow, LineStyle, Point, Repetition, Shadow, Dimensions as Size, Scale, TextStyle };
export { Path, Segment, Curve, Line };
export { DrawingError, PathError };

export { deepClone };
