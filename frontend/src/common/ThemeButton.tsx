import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { FC } from 'react';

type Props = {};

const ToggleDarkModeButton: FC<Props> = ({}) => {
  const { toggleColorMode } = useColorMode();
  const icon = useColorModeValue(<MoonIcon />, <SunIcon />);

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={icon}
      onClick={toggleColorMode}
      variant="ghost"
      size="md"
    />
  );
};

export default ToggleDarkModeButton;
