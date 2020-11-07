import styled from 'styled-components';

const Loading = styled.div`
  @keyframes spinner {
    from { transform: translate3d(-50%, -50%, 0) rotate(0deg)}
    50% { transform: translate3d(-50%, -50%, 0) rotate(180deg); opacity: 0.5; }
    to {transform: translate3d(-50%, -50%, 0) rotate(360deg)}
  }

  width: 100%;
  height: 100%;
  position: relative;

  &::before {
    animation: 1.5s linear infinite spinner;
    animation-play-state: inherit;
    border: solid 3px #f5f5f5;
    border-bottom-color: transparent;
    border-radius: 50%;
    content: "";
    height: 20px;
    width: 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
  }
`;

export default Loading;