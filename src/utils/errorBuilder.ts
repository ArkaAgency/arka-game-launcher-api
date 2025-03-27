export const errorBuilder = ({ en, fr }: { en: string; fr: string }) => {
  return {
    success: false,
    error: {
      message: {
        fr,
        en,
      },
    },
  };
};
