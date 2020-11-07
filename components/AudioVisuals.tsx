import React from 'react';
import styled from 'styled-components';

interface StyledProps {
  offset: number;
  type?: number;
}

const Bar = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  left: ${({offset}: StyledProps) => `${offset}px`};
  animation: bar 0.75s infinite;
  animation-delay: ${({type}: StyledProps) => `${0.1 * type}s`};
  transition: height 300ms;
  position: absolute;
  width: 10px;
  bottom: 0;

  @keyframes bar {
    from {height: 10%;}
    50% {height: 75%;}
    75% {height: 90%;}
    to {height: 10%;}
  }
`;

const AudioVisuals = () => (
  <>
    <Bar offset={0} type={1} />
    <Bar offset={15} type={2} />
    <Bar offset={30} type={3} />
    <Bar offset={45} type={1} />
    <Bar offset={60} type={5} />
    <Bar offset={75} type={2} />
  </>
)

export default AudioVisuals;