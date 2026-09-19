/** Converte um nome de ícone em kebab-case (como salvo em `achievements.icon`) para o nome do componente lucide-react em PascalCase. */
export function iconNameToPascalCase(kebab: string) {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}
