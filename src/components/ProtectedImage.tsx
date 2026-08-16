import type { DragEvent, ImgHTMLAttributes, MouseEvent } from "react";

export const protectedImageProps = {
  draggable: false,
  onContextMenu: (event: MouseEvent) => event.preventDefault(),
  onDragStart: (event: DragEvent) => event.preventDefault(),
} satisfies Partial<ImgHTMLAttributes<HTMLImageElement>>;

type Props = ImgHTMLAttributes<HTMLImageElement>;

export function ProtectedImage({ className = "", ...props }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...protectedImageProps}
      {...props}
      className={`protected-media ${className}`.trim()}
    />
  );
}
