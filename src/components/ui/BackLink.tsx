import { Link } from "react-router-dom";

type BackLinkProps = {
  to: string;
  children: string;
};

export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-amber-200/90 hover:text-amber-50"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
