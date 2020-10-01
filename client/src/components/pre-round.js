import './pre-round.scss';

import React from 'react';
import Button from './button';

const PreRound = ({ competing, ready, onReady, fight }) => (
  <div className="pre-round-container">
    <p className="headline2 round-title">Round {fight.currentRound || '?'}</p>
    <p className="headline4">Round Length: {parseInt(fight.roundDuration) / 60} minutes</p>
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
