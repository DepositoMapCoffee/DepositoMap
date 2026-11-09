/**
 * @/shared/ui — Design system de El Depósito.
 * Única puerta de entrada: importar siempre desde '@/shared/ui'.
 * Los tokens (colores, radios, sombras) viven en ./styles/tokens.css.
 */
export { cn } from './cn';
export { Logo } from './brand/Logo';
export { Button, buttonStyles, type ButtonVariant, type ButtonSize } from './components/Button';
export { Card } from './components/Card';
export { Badge, type BadgeTone } from './components/Badge';
export { Spinner } from './components/Spinner';
export { Container } from './components/Container';
export { TextField, TextAreaField, SelectField } from './components/Field';
export { EncabezadoSitio } from './layout/EncabezadoSitio';
export { PieSitio } from './layout/PieSitio';
