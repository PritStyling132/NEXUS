export type AuthFormProps = {
    id: string
    type: "email" | "text" | "password"
    inputType: "select" | "input"
    options?: { value: string; label: string; id: string }[]
    placeholder: string
    name: string
    label?: string
}
export const SIGN_UP_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "Enter your first name",
        name: "firstname",
        type: "text",
        label: "First Name",
    },
    {
        id: "2",
        inputType: "input",
        placeholder: "Enter your last name",
        name: "lastname",
        type: "text",
        label: "Last Name",
    },
    {
        id: "3",
        inputType: "input",
        placeholder: "Enter your email address",
        name: "email",
        type: "email",
        label: "Email Address",
    },
    {
        id: "4",
        inputType: "input",
        placeholder: "Create a password",
        name: "password",
        type: "password",
        label: "Password",
    },
]

export const SIGN_IN_FORM: AuthFormProps[] = [
    {
        id: "1",
        inputType: "input",
        placeholder: "Enter your email address",
        name: "email",
        type: "email",
        label: "Email Address",
    },
    {
        id: "2",
        inputType: "input",
        placeholder: "Enter your password",
        name: "password",
        type: "password",
        label: "Password",
    },
]
