import './pre-round.scss';

import React from 'react';
import Button from './button';

const PreRound = ({ competing, ready, onReady, roundNum }) => (
  <div className="round-start-container">
    <p className="headline2 round-title">Round {roundNum || '?'}</p>
    <p className="headline5 ready-prompt">
      {competing ? 'Are you ready to start the next round?' : 'Waiting on players to get ready...'}
    </p>
    {competing && (
      <Button variant={ready ? 'outline' : 'text'} onClick={onReady}>
        {ready ? "I'm" : 'Not'} Ready
      </Button>
    )}
  </div>
);

export default PreRound;
