import { Textarea } from "@/components/ui/textarea"
import { ErrorMessage } from "@hookform/error-message"
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"

type FormGeneratorProps = {
    type?: "text" | "email" | "password" | "number"
    inputType: "select" | "input" | "textarea"
    options?: { value: string; label: string; id: string }[]
    label?: string
    placeholder: string
    register: UseFormRegister<any>
    name: string
    errors: FieldErrors<FieldValues>
    lines?: number
}

export const FormGenerator = ({
    inputType,
    options,
    label,
    placeholder,
    register,
    name,
    errors,
    type,
    lines,
}: FormGeneratorProps) => {
    switch (inputType) {
        case "input":
            return (
                <Label
                    className="flex flex-col gap-2 text-foreground dark:text-themeTextGray"
                    htmlFor={`input-${label}`}
                >
                    {label && <span className="text-sm font-medium">{label}</span>}
                    <Input
                        id={`input-${label}`}
                        type={type}
                        placeholder={placeholder}
                        className="bg-card dark:bg-themeBlack border-border dark:border-themeGray text-foreground dark:text-themeTextGray placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        {...register(name)}
                    />
                    <ErrorMessage
                        errors={errors}
                        name={name}
                        render={({ message }) => (
                            <p className="text-red-500 dark:text-red-400 text-sm">
                                {message === "Required" ? "" : message}
                            </p>
                        )}
                    />
                </Label>
            )
        case "select":
            return (
                <Label
                    htmlFor={`select-${label}`}
                    className="flex flex-col gap-2 text-foreground dark:text-themeTextGray"
                >
                    {label && <span className="text-sm font-medium">{label}</span>}
                    <select
                        id={`select-${label}`}
                        className="w-full bg-card dark:bg-themeBlack border border-border dark:border-themeGray text-foreground dark:text-themeTextGray p-3 rounded-lg focus:ring-primary focus:border-primary"
                        {...register(name)}
                    >
                        {options?.length &&
                            options.map((option) => (
                                <option
                                    value={option.value}
                                    key={option.id}
                                    className="bg-card dark:bg-themeBlack"
                                >
                                    {option.label}
                                </option>
                            ))}
                    </select>
                    <ErrorMessage
                        errors={errors}
                        name={name}
                        render={({ message }) => (
                            <p className="text-red-500 dark:text-red-400 text-sm">
                                {message === "Required" ? "" : message}
                            </p>
                        )}
                    />
                </Label>
            )
        case "textarea":
            return (
                <Label
                    className="flex flex-col gap-2 text-foreground dark:text-themeTextGray"
                    htmlFor={`input-${label}`}
                >
                    {label && <span className="text-sm font-medium">{label}</span>}
                    <Textarea
                        className="bg-card dark:bg-themeBlack border-border dark:border-themeGray text-foreground dark:text-themeTextGray placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                        id={`input-${label}`}
                        placeholder={placeholder}
                        {...register(name)}
                        rows={lines}
                    />
                    <ErrorMessage
                        errors={errors}
                        name={name}
                        render={({ message }) => (
                            <p className="text-red-500 dark:text-red-400 text-sm">
                                {message === "Required" ? "" : message}
                            </p>
                        )}
                    />
                </Label>
            )
        default:
            return <></>
    }
}
