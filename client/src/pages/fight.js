import './fight.scss';

import React from 'react';
import io from 'socket.io-client';
import Nav from '../components/nav';
import UserContext from '../user-context';
import Card from '../components/card';
import Button from '../components/button';
import User from '../assets/user.png';
import PreRound from '../components/pre-round';
import api from '../api';
import RoundStart from '../components/round-start';

export default class Fight extends React.Component {
  static contextType = UserContext;

  constructor(props) {
    super(props);

    const { params } = props.match;
    this.state = {
      userId: params.userid || '',
      fightId: params.fightid || 'new',
      action: '',
      fight: {
        name: '',
        description: '',
        competitorCount: 2,
        roundDuration: 15 * 60,
        roundCount: 3,
        state: 'pre-round',
        ready: true,
        currentRound: 1,
      },
      showViewers: true,
      ready: false,
      socket: undefined,
      latency: '?',
      connection: 'connecting',
      copyUrlConfirm: false,
      imageSuggestion: '',
    };

    this.updateCompetitors = this.updateCompetitors.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.onStateFinish = this.onStateFinish.bind(this);
    this.onFightName = this.onFightName.bind(this);
    this.onCompetitorCount = this.onCompetitorCount.bind(this);
    this.onRoundDuration = this.onRoundDuration.bind(this);
    this.onRoundCount = this.onRoundCount.bind(this);
    this.toggleReady = this.toggleReady.bind(this);
    this.onNewFightSubmit = this.onNewFightSubmit.bind(this);
    this.copyFightViewUrl = this.copyFightViewUrl.bind(this);
    this.onImageSuggestion = this.onImageSuggestion.bind(this);
  }

  componentDidMount() {
    const { fightId, userId } = this.state;

    if (fightId !== 'new') {
      const socket = io({
        timeout: 10000,
        reconnectionAttempts: 20,
        transports: ['websocket'],
      });
      this.setState({ socket });

      socket.on('connect', () => {
        if (userId)
          socket.emit(
            'join_fight',
            {
              fightId,
              userId,
            },
            (data) => {
              if (data.success)
                return this.setState(
                  {
                    fight: {
                      ...data.fight,
                      stateTimeLeft: Math.max(data.fight.stateLength - data.stateTimeElapsed, 0),
                      roundDone: data.fight.stateLength - data.stateTimeElapsed <= 0,
                    },
                    connection: 'connected',
                    action: data.action,
                  },
                  function () {
                    if (data.fight.state !== 'pre-round') this.timer = setInterval(this.updateTimer, 1000);
                  }
                );
              this.setState({ connection: 'failed ' });
            }
          );
        else console.error('No UserId found');
      });

      socket.on('competitors_update', this.updateCompetitors);

      socket.on('viewers_update', (data) => {
        const { fight } = this.state;
        fight.viewers = [...data.viewers];
        this.setState({ fight });
      });

      socket.on('state_update', (data) => {
        const { fight } = this.state;
        fight.state = data.state;
        fight.stateLength = data.stateLength;
        this.setState({ fight: { ...fight, stateTimeLeft: data.stateLength } });
        this.timer = setInterval(this.updateTimer, 1000);
        console.log(this.timer);
      });

      socket.on('reconnecting', (attempt) => this.setState({ connection: 'connecting', latency: '?' }));
      socket.on('reconnect_failed', () => this.setState({ connection: 'failed', latency: '?' }));
      socket.on('connect_error', () => this.setState({ connection: 'failed', latency: '?' }));
      socket.on('connect_timeout', () => this.setState({ connection: 'failed', latency: '?' }));
      socket.on('pong', (latency) => this.setState({ latency }));

      // console.log(params.id ? `Current fight id: ${params.id}` : "Couldn't find fight id!");
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateCompetitors(data) {
    const { fight } = this.state;
    fight.competitors = [...data.competitors];
    this.setState({ fight });
  }

  updateTimer() {
    // clearInterval(this.timer);

    // console.log('updating timer');
    const { fight, socket, fightId, userId } = this.state;
    if (fight.stateTimeLeft <= 0) {
      this.setState({ fight: { ...fight, roundDone: true } });
      clearInterval(this.timer);
      socket.emit('state_finish', { userId }, this.updateCompetitors);
      this.onStateFinish();
    } else {
      if (fight && fight.stateTimeLeft) this.setState({ fight: { ...fight, stateTimeLeft: fight.stateTimeLeft - 1 } });
    }
  }

  onStateFinish() {
    const { fight } = this.state;
    console.log(fight.state);
  }

  componentWillUnmount() {
    const { socket } = this.state;
    socket.disconnect();
  }

  onFightName(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.name = value;
    this.setState({ fight: { ...fight } });
  }

  onCompetitorCount(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.competitorCount = parseInt(value);
    this.setState({ fight: { ...fight } });
  }

  onRoundDuration(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.roundDuration = parseInt(value) * 60;
    this.setState({ fight: { ...fight } });
  }

  onRoundCount(e) {
    const { fight } = this.state,
      { value } = e.target;
    fight.roundCount = parseInt(value);
    this.setState({ fight: { ...fight } });
  }

  toggleReady() {
    const { ready, socket, fight } = this.state,
      { hashid } = this.context;
    socket.emit('competitor_ready', { userId: hashid, ready: !ready }, (data) => {
      if (data.error) return console.error(data.error);
      fight.competitors = [...data.competitors];
      this.setState({ ready: !ready, fight });
    });
    // this.setState({ ready: !ready });
  }

  onNewFightSubmit(e) {
    e.preventDefault();

    const { fight } = this.state;

    api
      .post('/fights/new', { ...fight })
      .then((response) => response.json())
      .then(
        (response) => {
          if (!response.success) return this.setState({ error: { ...response.error } });
          window.location.href = response.fight.competeUrl;
        },
        (err) => console.error(err)
      );
  }

  copyFightViewUrl() {
    const { fight } = this.state;
    navigator.clipboard
      .writeText(`${process.env.NODE_ENV === 'development' ? 'localhost:3000' : process.env.PUBLIC_URL}${fight.viewUrl}`)
      .then(() => {
        this.setState({ copyUrlConfirm: true }, () => setTimeout(() => this.setState({ copyUrlConfirm: false }), 1000));
      });
  }

  onImageSuggestion(e) {
    const { files } = e.target;
    console.log(files[0]);
    this.setState({ imageSuggestion: files[0] });
    if (files[0]) {
      if (files[0].size > 2000000) return this.setState({ error: { message: 'File too large. Maximum file size is 2mb.' } });
    }
  }

  render() {
    const {
      action,
      fightId,
      fight,
      showViewers,
      connection,
      latency,
      socket,
      copyUrlConfirm,
      error,
      imageSuggestion,
    } = this.state;
    const contextUser = this.context;
    const { redirect } = this.props;
    const { params } = this.props.match;

    if (redirect && contextUser.hashid) {
      window.location.href = `/${contextUser.hashid}/fights/${params.fightId}`;
      return (
        <div className="redirecting">
          <p className="headline3">
            Redirecting you to your fight<span className="dot1">.</span>
            <span className="dot2">.</span>
            <span className="dot3">.</span>
          </p>
        </div>
      );
    }

    return (
      <div className="fight-container">
        <Nav variant="solid" />
        {fightId === 'new' && (
          <div className="new-modal-container">
            <Card className="new-modal">
              <p className="headline5">New Fight</p>
              {error && <p className="headline6 error">Error: {error._message || 'An unknown error ocurred.'}</p>}
              <form className="form-fluid" onSubmit={this.onNewFightSubmit}>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Fight Name
                  </label>
                  <input
                    type="text"
                    className="surface-24-flat"
                    placeholder="Name"
                    onChange={this.onFightName}
                    value={fight.name}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Competitor Count
                  </label>
                  <input
                    type="number"
                    className="surface-24-flat"
                    placeholder="Name"
                    onChange={this.onCompetitorCount}
                    value={fight.competitorCount}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Round Duration
                  </label>
                  <select className="surface-24-flat" onChange={this.onRoundDuration} value={fight.roundDuration}>
                    <option value="600">10 min</option>
                    <option value="900">15 min</option>
                    <option value="1200">20 min</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fightName" className="headline6">
                    Round Count
                  </label>
                  <select className="surface-24-flat" onChange={this.onRoundCount} value={fight.roundCount}>
                    <option value="3">3 rounds</option>
                    <option value="5">5 rounds</option>
                    <option value="7">7 rounds</option>
                  </select>
                </div>
                <div className="buttons">
                  <Button type="submit">Create</Button>
                  <Button to="/dashboard" variant="text">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        {(action === 'compete' || action === 'view') && (
          <div className={`${action}-container`}>
            <div className="fight-title surface-1-flat">
              <div className="fight-details">
                <div className="headline6">
                  {fight ? fight.name : ''}
                  <div className={`connection-container ${connection}`}>
                    {connection === 'connected' && <i className="fa fa-check" />}
                    {connection === 'failed' && <i className="fa fa-times" />}
                    {connection === 'connecting' && <i className="fa fa-circle-notch fa-spin" />}
                    {connection} ({latency} ms)
                  </div>
                </div>
                <Button
                  variant="icon"
                  onClick={() => this.copyText(fight.competeUrl)}
                  className={`copy-icon-btn ${copyUrlConfirm ? 'copy-success' : ''}`}
                  icon={copyUrlConfirm ? 'check' : 'bomb'}
                  title="Share Compete URL"
                />
                <Button
                  variant="text"
                  onClick={() => this.copyFightViewUrl(fight.viewUrl)}
                  className={`copy-btn ${copyUrlConfirm ? 'copy-success' : ''}`}
                  title="Share View URL"
                >
                  <i className={`fa fa-${copyUrlConfirm ? 'check' : 'eye'}`} />
                  {copyUrlConfirm ? 'Copied!' : 'View'}
                </Button>
              </div>
              <div className="competitors-container">
                {fight.competitors &&
                  fight.competitors.map((competitor) => (
                    <div key={competitor.user.hashid} className="competitor">
                      <img src={User} className="competitor-pfp" alt={competitor.user.username} />
                      <div className="competitor-name-container">
                        <p className={`competitor-name ${competitor.ready ? 'ready' : ''}`}>{competitor.user.username}</p>
                        <p className={`competitor-ready ${competitor.ready ? 'ready' : ''}`}>
                          {competitor.ready ? 'Ready' : 'Not Ready'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="main">
              {showViewers && (
                <div className="viewers-container surface-1-flat">
                  <div className="viewers-title">
                    <span className="caps">viewers:</span>
                    <span className="viewer-count">
                      {fight.viewers
                        ? fight.viewers.length > 1000
                          ? `${(fight.viewers.length / 1000).toFixed(1)}k`
                          : fight.viewers.length
                        : 0}
                    </span>
                  </div>
                  <div className="viewer-list">
                    {fight.viewers && fight.viewers.length > 0 ? (
                      fight.viewers.map((viewer) => (
                        <div key={viewer.user.hashid} className="viewer">
                          <img src={User} className="viewer-pfp" alt="Viewer" />
                          <p className="viewer-name">{viewer.user.username}</p>
                        </div>
                      ))
                    ) : (
                      <div className="viewer no-viewers">
                        <p className="viewer-name">No Viewers</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {action !== '' && fight.state === 'pre-round' && (
                <PreRound
                  competing={action === 'compete'}
                  ready={
                    action === 'compete' && fight.competitors && socket
                      ? fight.competitors.filter((c) => c.user.hashid === contextUser.hashid)[0].ready
                      : false
                  }
                  onReady={this.toggleReady}
                  fight={fight}
                />
              )}
              {action !== '' && fight.state === 'round-start' && (
                <RoundStart
                  competing={action === 'compete'}
                  fight={fight}
                  onImage={this.onImageSuggestion}
                  image={imageSuggestion}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
