interface LogoProps {
    height: number;
    width: number;
}

export function Logo(props: LogoProps) {
    return <img src="/logo.svg" height={props.height} width={props.width} alt="Application logo" />;
}
