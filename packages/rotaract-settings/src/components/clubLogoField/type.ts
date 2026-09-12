export type ClubLogoFieldProps = {
  clubName: string;
  logoUrl: string;
  onChange: (logoUrl: string) => void;
  onError: (message: string) => void;
};

export type UseClubLogoFieldProps = {
  onChange: (logoUrl: string) => void;
  onError: (message: string) => void;
};
