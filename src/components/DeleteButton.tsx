"use client";

export function DeleteButton({
  action,
  label = "Delete",
  confirm = "Are you sure? This cannot be undone.",
  className = "btn-danger btn-sm",
}: {
  action: () => void;
  label?: string;
  confirm?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
