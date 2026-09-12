export type MemberPhotoFieldProps = {
  name: string;
  photoUrl: string;
  onChange: (photoUrl: string) => void;
  onError: (message: string) => void;
};