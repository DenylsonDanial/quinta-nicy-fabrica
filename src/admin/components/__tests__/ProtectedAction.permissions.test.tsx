import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedAction } from '../../../core/components/ProtectedAction';

const useAuthMock = vi.fn();
const usePermissionsMock = vi.fn();

vi.mock('../../../core/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../../core/hooks/usePermissions', () => ({
  usePermissions: () => usePermissionsMock(),
}));

describe('ProtectedAction permission guard', () => {
  it('oculta acao critica quando perfil nao autorizado', () => {
    useAuthMock.mockReturnValue({ user: { id: 'user-1' } });
    usePermissionsMock.mockReturnValue({
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      isLoading: false,
    });

    render(
      <ProtectedAction permission="stock.adjust">
        <button type="button">Ajustar stock</button>
      </ProtectedAction>,
    );

    expect(screen.queryByText('Ajustar stock')).not.toBeInTheDocument();
  });

  it('renderiza acao critica para perfil autorizado', () => {
    useAuthMock.mockReturnValue({ user: { id: 'user-2' } });
    usePermissionsMock.mockReturnValue({
      hasPermission: (perm: string) => perm === 'stock.adjust',
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
      isLoading: false,
    });

    render(
      <ProtectedAction permission="stock.adjust">
        <button type="button">Ajustar stock</button>
      </ProtectedAction>,
    );

    expect(screen.getByText('Ajustar stock')).toBeInTheDocument();
  });
});
