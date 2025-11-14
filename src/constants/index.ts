import { AuthFormProps, SIGN_IN_FORM, SIGN_UP_FORM } from "./forms"
import { LANDING_PAGE_MENU, MenuProps } from "./menus"
import {
    CREATE_GROUP_PLACEHOLDER,
    CreateGroupPlaceholderProps,
} from "./placeholder"

type NexusConstantsProps = {
    landingPageMenu: MenuProps[]
    signUpForm: AuthFormProps[]
    signInForm: AuthFormProps[]
    //     groupList:GroupListProps[]
    createGroupPlaceholder: CreateGroupPlaceholderProps[]
}

export const NEXUS_CONSTANTS: NexusConstantsProps = {
    landingPageMenu: LANDING_PAGE_MENU,
    signUpForm: SIGN_UP_FORM,
    signInForm: SIGN_IN_FORM,
    //     groupList:GROUP_LIST,
    createGroupPlaceholder: CREATE_GROUP_PLACEHOLDER,
}
