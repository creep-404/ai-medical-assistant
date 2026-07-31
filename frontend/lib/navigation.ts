export function getDashboardPath(role?: string | null): string {
  switch (role) {
    case 'doctor':
      return '/doctor/dashboard'
    case 'admin':
      return '/admin/dashboard'
    case 'patient':
    default:
      return '/patient/dashboard'
  }
}
