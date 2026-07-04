import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { resizeImage } from '../lib/resizeImage';
import { useAuthStore } from '../store/auth.store';
import { Button, Card, ConfirmDialog, Field, Input, PageHeader } from '../components/ui';

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [avatarError, setAvatarError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/users/me', { name, phone });
      updateUser({ ...user!, name: data.name, phone: data.phone });
      setProfileSuccess('Perfil atualizado com sucesso.');
    } catch (err: any) {
      setProfileError(err.response?.data?.message ?? 'Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAvatarError('');
    if (!file.type.startsWith('image/')) {
      setAvatarError('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await resizeImage(file);
      const { data } = await api.patch('/users/me/avatar', { avatarUrl });
      updateUser({ ...user!, avatarUrl: data.avatarUrl });
    } catch (err: any) {
      setAvatarError(err.response?.data?.message ?? 'Erro ao atualizar foto.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess('Senha alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message ?? 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      await api.delete('/users/me');
      logout();
      navigate('/login');
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto w-full space-y-6">
      <PageHeader align="start" title="👤 Meu perfil" />

      <Card className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 text-xl font-semibold flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
          >
            Trocar foto
          </Button>
          {avatarError && <p className="text-red-500 text-sm mt-2">{avatarError}</p>}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Meus dados</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="E-mail">
            <Input value={user?.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
          </Field>
          <Field label="Telefone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </Field>

          {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
          {profileSuccess && <p className="text-green-600 text-sm">{profileSuccess}</p>}

          <Button type="submit" loading={savingProfile} loadingText="Salvando...">
            Salvar dados
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Alterar senha</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Field label="Senha atual">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>
          <Field label="Nova senha">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirmar nova senha">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>

          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}

          <Button type="submit" loading={savingPassword} loadingText="Salvando...">
            Alterar senha
          </Button>
        </form>
      </Card>

      {user?.role === 'CLIENT' && (
        <Card>
          <h2 className="font-semibold text-gray-900">Zona de risco</h2>
          <p className="text-sm text-gray-500 mt-1">
            Excluir sua conta apaga permanentemente seu perfil e histórico de agendamentos. Essa
            ação não pode ser desfeita.
          </p>
          <Button variant="danger" size="sm" className="mt-4" onClick={() => setShowDeleteConfirm(true)}>
            Excluir conta
          </Button>
        </Card>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir conta"
        message="Tem certeza que deseja excluir sua conta? Essa ação é permanente e vai apagar seu perfil e histórico de agendamentos."
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deletingAccount}
      />
    </div>
  );
}
