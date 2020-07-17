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

export default class Fight extends React.Component {
  static contextType = UserContext;

  constructor(props) {
    super(props);

    const { params } = props.match;
    this.state = {
      userid: params.userid || '',
      action: params.action || 'new',
      fightId: params.id,
      fight: {
        name: '',
        description: '',
        competitorCount: 2,
        roundDuration: 15,
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
    };

    this.onFightName = this.onFightName.bind(this);
    this.onCompetitorCount = this.onCompetitorCount.bind(this);
    this.onRoundDuration = this.onRoundDuration.bind(this);
    this.onRoundCount = this.onRoundCount.bind(this);
    this.toggleReady = this.toggleReady.bind(this);
    this.onNewFightSubmit = this.onNewFightSubmit.bind(this);
  }

  componentDidMount() {
    const { action, userid } = this.state,
      { params } = this.props.match;

    if (action !== 'new') {
      const socket = io({
        reconnectionAttempts: 20,
      });
      this.setState({ socket });

      socket.on('connect', () => {
        if (userid)
          socket.emit(
            action === 'compete' ? 'join_fight' : 'view_fight',
            {
              fightId: params.id,
              userId: userid,
            },
            (data) => {
              if (data.success) return this.setState({ fight: data.fight, connection: 'connected' });
              this.setState({ connection: 'failed ' });
            }
          );
        else console.error('No UserId found');
      });

      socket.on('competitors_update', (data) => {
        const { fight } = this.state;
        fight.competitors = [...data.competitors];
        this.setState({ fight });
      });

      socket.on('competitor_leave', (data) => {
        const { fight } = this.state;
        let competitorIndex = fight.competitors.map((c) => c.socketId).indexOf(data.socketId);
        fight.competitors.splice(competitorIndex, 1);
        this.setState({ fight });
      });

      socket.on('reconnecting', (attempt) => this.setState({ connection: 'connecting', latency: '?' }));

      socket.on('reconnect_failed', () => this.setState({ connection: 'failed', latency: '?' }));
      socket.on('connect_error', () => this.setState({ connection: 'failed', latency: '?' }));
      socket.on('connect_timeout', () => this.setState({ connection: 'failed', latency: '?' }));

      socket.on('pong', (latency) => this.setState({ latency }));

      console.log(params.id ? `Current fight id: ${params.id}` : "Couldn't find fight id!");
    }
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
    fight.roundDuration = parseInt(value);
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

    const { fight, userid } = this.state;

    api
      .post('/fights/new', { ...fight })
      .then((response) => response.json())
      .then(
        (response) => {
          window.location.href = `/${userid}/fights/compete/${response.fight.hashid}`;
        },
        (err) => console.error(err)
      );
  }

  render() {
    const { action, fight, showViewers, connection, latency } = this.state;
    const contextUser = this.context;

    return (
      <div className="fight-container">
        <Nav variant="solid" />
        {action === 'new' && (
          <div className="new-modal-container">
            <Card className="new-modal">
              <i className="fa fa-times" />
              <p className="headline5">New Fight</p>
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
                    <option value="10">10 min</option>
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
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
                  <Button variant="text">Cancel</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        {(action === 'compete' || action === 'view') && (
          <div className={`${action}-container`}>
            <div className="fight-title surface-1-flat">
              <div className="headline6">
                {fight ? fight.name : ''}
                <div className={`connection-container ${connection}`}>
                  {connection === 'connected' && <i className="fa fa-check" />}
                  {connection === 'failed' && <i className="fa fa-times" />}
                  {connection === 'connecting' && <i className="fa fa-circle-notch fa-spin" />}
                  {connection} ({latency} ms)
                </div>
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
                    <span className="viewer-count">10k</span>
                  </div>
                  <div className="viewer-list">
                    <div className="viewer">
                      <img src={User} className="viewer-pfp" alt="Viewer" />
                      <p className="viewer-name">BradHacker</p>
                    </div>
                  </div>
                </div>
              )}
              {fight.state === 'pre-round' && (
                <PreRound
                  competing={action === 'compete'}
                  ready={
                    fight.competitors ? fight.competitors.filter((c) => c.user.hashid === contextUser.hashid)[0].ready : false
                  }
                  onReady={this.toggleReady}
                  roundNum={fight.currentRound}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
