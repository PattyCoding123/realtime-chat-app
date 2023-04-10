import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";

export const ButtonVariants = cva(
  // Define the base styling of reusable button
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "bg-transparent hover:text-slate-900 hover:bg-slate-200",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
      },
    },
    // Specify the default variants (if no class variants are applied)
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define the props that can be passed to the button
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ButtonVariants> {
  isLoading?: boolean;
}

/*
  The Button component is a wrapper around the HTML button element that adds
  styling and various props that can be used to customize the button.
  The button can be customized using the `variant` and `size` props.
  The `variant` prop can be set to either `default` or `ghost`.
  The `size` prop can be set to either `default`, `sm`, or `lg`.
  The button can also be disabled by passing the `disabled` prop.
  The button can also be rendered as a loading state by passing the `isLoading` prop.
  The button also accepts any props that are valid for the HTML button element.
*/
const Button: FC<ButtonProps> = ({
  className,
  children,
  variant,
  isLoading,
  size,
  ...props
}) => {
  return (
    <button
      className={cn(ButtonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
};

export default Button;
