import React from 'react';
import styled from 'styled-components';

const StyledRecorderIcon = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  & .recordOutline {
    height: 20px;
    width: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 10px;

    & .record {
      height: 100%;
      width: 100%;
      background-color: red;
      animation: blink 1s infinite;
      border-radius: 50%;
    }
  }

  @keyframes blink {
    to {opacity: 1;}
    50% {opacity: 0.5;}
    from {opacity: 1;}
  }
`;

const RecorderIcon = () => (
  <StyledRecorderIcon>
    <div className="recordOutline">
      <div className="record" />
    </div>
  </StyledRecorderIcon>
)

export default RecorderIcon;