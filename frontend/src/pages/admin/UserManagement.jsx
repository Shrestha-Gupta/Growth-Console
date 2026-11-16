// frontend/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import PaginationControls from '../../components/common/PaginationControls';
import StatusPill from '../../components/common/StatusPill';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { TextInput, PasswordInput } from '../../components/common/Inputs';
import SelectDropdown from '../../components/common/SelectDropdown';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/feedback/ToastContext';
import { LoadingState, ErrorState } from '../../components/feedback/FeedbackStates';
import usePageEntrance from '../../hooks/usePageEntrance';
import api from '../../services/api';

/**
 * UserManagement
 * Central CRUD and governance hub for user records.
 * Connected to Phase 7 backend REST API with server-side pagination, search, filters,
 * and Last Active Admin Safeguard.
 */
export const UserManagement = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const entranceRef = usePageEntrance();

  // Data State
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
  });

  // Fetch Users from Backend
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        order: sortOrder,
      });

      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res?.data || []);
      setTotalRecords(res?.meta?.total || 0);
      setTotalPages(res?.meta?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to retrieve user registry.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedRole, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please complete all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success(`User ${formData.name} provisioned successfully.`);
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to provision user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit User
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser._id}`, {
        name: formData.name,
        role: formData.role,
        status: formData.status,
      });
      toast.success(`User ${formData.name} updated successfully.`);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/users/${selectedUser._id}`);
      toast.success(`User ${selectedUser.name} deleted successfully.`);
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'Member Name',
      field: 'name',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>{row.name}</strong>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            ID: {row._id}
          </span>
        </div>
      ),
    },
    {
      header: 'Email Address',
      field: 'email',
      sortable: true,
    },
    {
      header: 'Role Tier',
      field: 'role',
      sortable: true,
      render: (row) => <StatusPill status={row.role} type="role" />,
    },
    {
      header: 'Account Status',
      field: 'status',
      sortable: true,
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Enrolled',
      field: 'createdAt',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/${row._id}`);
            }}
            aria-label="View user details"
            title="View Details"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-sunken)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            <Eye size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row);
            }}
            aria-label="Edit user"
            title="Edit Record"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-sunken)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            <Edit2 size={14} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(row);
            }}
            aria-label="Delete user"
            title="Delete Record"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-destructive)',
              backgroundColor: 'rgba(155, 61, 61, 0.08)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div ref={entranceRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Action Bar */}
      <div
        className="gsap-reveal"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-gold)',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            System Registry
          </span>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            User Administration & Governance
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            title="Refresh Registry"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <PrimaryButton
            onClick={() => {
              setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
              setIsCreateModalOpen(true);
            }}
            icon={Plus}
          >
            New Member Record
          </PrimaryButton>
        </div>
      </div>

      {/* Discovery & Filter Bar */}
      <div
        className="gsap-reveal"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 280px', maxWidth: '400px' }}>
          <TextInput
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            icon={Search}
          />
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Role Segmented Filter */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--color-bg-sunken)',
              border: '1px solid var(--color-border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            {['all', 'admin', 'user'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRole(r);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  fontWeight: selectedRole === r ? '600' : '500',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color:
                    selectedRole === r
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                  backgroundColor:
                    selectedRole === r ? 'var(--color-bg-base)' : 'transparent',
                  boxShadow:
                    selectedRole === r ? 'var(--shadow-subtle)' : 'none',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div style={{ width: '150px' }}>
            <SelectDropdown
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : (
        /* Main Data Table & Pagination */
        <div className="gsap-reveal">
          <DataTable
            columns={columns}
            data={users}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
            }}
            onRowClick={(row) => navigate(`/admin/users/${row._id}`)}
            emptyMessage={isLoading ? 'Loading records from database...' : 'No user records matching the filter criteria.'}
          />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            limit={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision Member Account"
        subtitle="Create a new credentialed user account with assigned role and status."
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextInput
            label="Full Name"
            name="name"
            placeholder="Enter member full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@organization.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <PasswordInput
            label="Initial Password"
            name="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <SelectDropdown
              label="Assigned Role"
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
              options={[
                { value: 'user', label: 'Standard User' },
                { value: 'admin', label: 'Administrator' },
              ]}
            />

            <SelectDropdown
              label="Account Status"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <SecondaryButton type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Provision Record
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Member Record"
        subtitle={`Editing account parameters for ${selectedUser?.name}`}
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            disabled
            helperText="Email modification is restricted to root migration protocols."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <SelectDropdown
              label="Assigned Role"
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
              options={[
                { value: 'user', label: 'Standard User' },
                { value: 'admin', label: 'Administrator' },
              ]}
            />

            <SelectDropdown
              label="Account Status"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <SecondaryButton type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Save Modifications
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Permanent Record Deletion"
        description={`You are about to permanently purge the account of ${selectedUser?.name}. All associated profile telemetry will be unlinked.`}
        confirmEmail={selectedUser?.email}
        isLastAdminWarning={selectedUser?.role === 'admin'}
      />
    </div>
  );
};

export default UserManagement;
