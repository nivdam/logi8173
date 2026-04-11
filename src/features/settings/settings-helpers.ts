import type { AuthenticatedOperator, OperatorRole } from "../../lib/auth.types"
import type { Company } from "../../types"
import { t } from "../../lib/i18n"

const operatorRoles: OperatorRole[] = ["admin", "warehouse_operator", "commander", "viewer"]

export const getOperatorRoleOptions = () =>
  operatorRoles.map((role) => ({
    value: role,
    label: t(`roles.${role}`),
  }))

export const sortOperators = (operators: AuthenticatedOperator[]) =>
  [...operators].sort((left, right) => {
    const leftLabel = (left.fullName || left.email).toLocaleLowerCase()
    const rightLabel = (right.fullName || right.email).toLocaleLowerCase()
    return leftLabel.localeCompare(rightLabel)
  })

export const sortCompanies = (companies: Company[]) =>
  [...companies].sort((left, right) => left.name.localeCompare(right.name))
