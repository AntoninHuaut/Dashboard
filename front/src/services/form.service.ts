import { Md5 } from 'ts-md5';

export const handleInputChange = <T>(
  event: React.ChangeEvent<HTMLInputElement>,
  set: React.Dispatch<React.SetStateAction<T>>,
) => {
  set((prev) => ({ ...prev, [event.target.name]: event.target.value }));
};

export const getGravatarUrl = (email: string) => {
  return `https://www.gravatar.com/avatar/${Md5.hashStr(email.trim().toLowerCase())}`;
}