export const getSafeUsername = (user: User): string => {
  if (!('provider' in user)) {
    return user.email;
  }

  switch (user.provider) {
    case 'github':
      return user.name;
  }
};

export interface EmailUser {
  id: string;
  name?: string;
  email: string;
  image?: string;
}
export interface GithubUser {
  provider: 'github';
  id: string;
  name: string;
  email?: string;
  image?: string;
}
export type User = EmailUser | GithubUser;
