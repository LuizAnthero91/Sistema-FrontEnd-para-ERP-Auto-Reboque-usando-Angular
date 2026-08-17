import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { PermissaoCodigo } from '../models/api.models';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const permissao =
    route.data['permissao'] as PermissaoCodigo | undefined;

  if (!permissao) {
    return true;
  }

  return auth.temPermissao(permissao)
    ? true
    : router.createUrlTree(['/dashboard']);
};