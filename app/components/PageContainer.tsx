import type { HTMLAttributes } from "react";

// The outermost wrapper of every page and of the loading skeleton: one max width and the
// page inset (16 px on phones, 40 px from md), so nothing jumps sideways when a page loads.
// className adds layout only; never a competing width or padding.
export default function PageContainer({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-page-container
      {...rest}
      className={`mx-auto w-full max-w-page px-page py-page ${className}`}
    />
  );
}
