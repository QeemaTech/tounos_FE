/**
 * useBranchScope — Centralized branch-scoping for all admin pages.
 *
 * Returns everything a page needs to handle branch-restricted admins:
 *  - `branches`        → Only branches this admin can see (all for super_admin)
 *  - `isSuperAdmin`    → Boolean
 *  - `defaultBranchId` → Set for single-branch admins, null for super_admin
 *  - `branchFilter`    → Current filter value (auto-locked for branch admins)
 *  - `setBranchFilter` → No-op for branch admins; controllable for super_admin
 *  - `isBranchLocked`  → True when a branch admin cannot change branch context
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '../api/endpoints';
import { useAuth } from './useAuth';

export function useBranchScope(options = {}) {
  const { enabled = true } = options;
  const { isSuperAdmin, defaultBranchId, branchIds } = useAuth();

  // Branch admins are locked to their branch; super admins can filter freely.
  const isBranchLocked = !isSuperAdmin && !!defaultBranchId;
  const [branchFilter, _setBranchFilter] = useState(defaultBranchId || '');

  const setBranchFilter = (val) => {
    if (isBranchLocked) return; // Prevent branch admins from changing scope
    _setBranchFilter(val);
  };

  // Only fetch branches when: super admin (need dropdown) OR when explicitly needed.
  // Branch admins don't need a dropdown at all.
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches-scoped', { isSuperAdmin, branchIds }],
    queryFn: async () => {
      if (isSuperAdmin) {
        // Super admin: fetch all branches
        const r = await branchesApi.list({ pageSize: 200 });
        return r.data.data || [];
      } else {
        // Branch admin: only return their own branches from a targeted fetch
        const r = await branchesApi.list({ pageSize: 200 });
        const all = r.data.data || [];
        return branchIds.length > 0 ? all.filter(b => branchIds.includes(b.id)) : all;
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes — branches don't change often
  });

  const result = {
    branches: branchesData || [],
    isLoadingBranches,
    isSuperAdmin,
    defaultBranchId,
    branchIds,
    branchFilter,
    setBranchFilter,
    isBranchLocked,
  };

  return result;
}

