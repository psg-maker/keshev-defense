// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.

// 13단계: 로그인 사용자·기기·세션 표시
const DEVICE_LABELS = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
const SESSION_LABELS = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
const MODE_LABELS = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
const GOOD = new Set(['compliant', 'active']);

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
}

// 목록에 없는 상태값은 정상으로 보이지 않게 확인 불가로 표시한다. 색과 함께 글자와 원래 값을 보여 준다.
function statusLine(name, labels, value) {
  const code = Object.hasOwn(labels, value) ? value : 'unknown';
  const kind = GOOD.has(code) ? 'ok' : code === 'unknown' ? 'empty' : 'error';
  const line = node('p', `${name}: ${labels[code]} (${String(value ?? 'unknown')})`, `state state-${kind}`);
  line.dataset.state = code;
  return line;
}

// 매번 새 요소를 만들어 돌려주므로 다시 불러오면 이전 표시가 통째로 교체되고, 오류일 때 이전 사용자 값은 남지 않는다.
function section(title, resource, renderOk) {
  const box = node('section');
  box.append(node('h3', title));
  const status = resource?.status;
  if (resource?.mode != null && resource.mode !== 'connected') {
    box.append(node('p', `연결 모드: ${MODE_LABELS[resource.mode] ?? MODE_LABELS.unknown}`, 'state state-empty'));
  }
  if (status === 'loading') box.append(node('p', '불러오는 중…', 'state state-loading'));
  else if (status === 'error') {
    const prefix = resource.error?.code === 'CONTRACT_MISMATCH' ? '확인 불가' : '연결 실패';
    const line = node('p', `${prefix}: ${resource.error?.message ?? '서버 메시지 없음'}`, 'state state-error');
    line.setAttribute('role', 'alert');
    box.append(line);
  } else if (status === 'ok') box.append(...renderOk(resource.data));
  else box.append(node('p', '확인 불가: 알 수 없는 상태입니다.', 'state state-empty'));
  return box;
}

function renderIdentity({ me, devices, sessions } = {}) {
  const root = node('div', null, 'student-identity');
  root.append(
    section('내 계정과 현재 접속', me, (data) => [
      node('p', `사용자: ${data?.user?.label ?? '확인 불가'} (ID: ${data?.user?.id ?? '확인 불가'})`),
      node('p', `현재 기기: ${data?.device?.label ?? '확인 불가'} (ID: ${data?.device?.id ?? '확인 불가'})`),
      statusLine('기기 보안 상태', DEVICE_LABELS, data?.device?.status),
      node('p', `현재 세션 ID: ${data?.session?.id ?? '확인 불가'}`),
      statusLine('세션 상태', SESSION_LABELS, data?.session?.status),
    ]),
    section('내 기기 목록', devices, (list) => {
      if (!Array.isArray(list) || list.length === 0) return [node('p', '등록된 기기가 없습니다.', 'state state-empty')];
      const items = node('ul');
      for (const device of list) {
        const item = node('li');
        item.append(node('p', `${device?.label ?? '이름 확인 불가'} (ID: ${device?.id ?? '확인 불가'})`), statusLine('보안 상태', DEVICE_LABELS, device?.status));
        items.append(item);
      }
      return [items];
    }),
    section('내 세션 목록', sessions, (list) => {
      if (!Array.isArray(list) || list.length === 0) return [node('p', '세션이 없습니다.', 'state state-empty')];
      const items = node('ul');
      for (const session of list) {
        const item = node('li');
        item.append(statusLine(`세션 ${session?.id ?? 'ID 확인 불가'}`, SESSION_LABELS, session?.status));
        items.append(item);
      }
      return [items];
    }),
  );
  return root;
}

// 14단계: 업무 앱 접근 요청 결과 표시
const DECISIONS = {
  allow: { label: '접근 허용', kind: 'ok', note: '정책상 접근 허용 판정이며 실제 앱 접속 성공을 보장하지 않습니다.' },
  deny: { label: '접근 거부', kind: 'error', note: '정책에 따라 이 앱에 대한 접근이 거부되었습니다.' },
  challenge: { label: '추가 인증 또는 확인 필요', kind: 'error', note: '추가 확인이 필요합니다. 이 앱은 추가 인증 절차를 대신 수행하지 않습니다.' },
  unknown: { label: '판정 확인 불가', kind: 'empty', note: '허용되지 않음: 판정을 확인할 수 없으므로 접근 허용으로 간주하지 않습니다.' },
};

function renderDecision({ status, mode, data, error, appId } = {}) {
  const root = node('div', null, 'student-decision');
  root.dataset.status = String(status ?? 'unknown');
  if (mode != null && mode !== 'connected') root.append(node('p', `연결 모드: ${MODE_LABELS[mode] ?? MODE_LABELS.unknown}`, 'state state-empty'));
  if (status === 'idle') root.append(node('p', '앱을 골라 접속을 요청하세요.', 'state state-empty'));
  else if (status === 'loading') root.append(node('p', `판정 확인 중… (대상 앱: ${appId ?? '확인 불가'})`, 'state state-loading'));
  else if (status === 'error') {
    const line = node('p', `요청 실패: ${error?.message ?? '서버 메시지 없음'}`, 'state state-error');
    line.setAttribute('role', 'alert');
    root.append(line, node('p', `대상 앱: ${appId ?? '확인 불가'}`), node('p', '서버의 판정을 받지 못했습니다. 이 결과는 접근 거부 판정이 아니며 접근 허용도 아닙니다.'));
  } else if (status === 'ok') {
    // 네 값이 아니면 원래 값과 상관없이 unknown으로 보고, 허용으로 보이지 않게 한다.
    const code = Object.hasOwn(DECISIONS, data?.decision) ? data.decision : 'unknown';
    const decision = DECISIONS[code];
    root.dataset.decision = code;
    root.append(
      node('p', `대상 앱: ${data?.appId ?? appId ?? '확인 불가'}`),
      node('p', `판정: ${decision.label}(${code})`, `state state-${decision.kind}`),
      node('p', decision.note),
      node('p', `판정 이유: ${data?.reason || '서버가 이유를 보내지 않았습니다.'}`),
      node('p', `판정 시각: ${data?.checkedAt ?? '확인 불가'}`),
    );
  } else root.append(node('p', '확인 불가: 알 수 없는 요청 상태입니다. 접근 허용으로 간주하지 않습니다.', 'state state-empty'));
  return root;
}

// 15단계: 접속 기록·XDR 경보 목록과 상세 보기
const KIND_LABELS = { access: '접속 기록', xdr: 'XDR 경보' };
const ACCESS_LABELS = { allowed: '접속 허용', denied: '접속 거부', unknown: '확인 불가' };
const NO_APP = ''; // appId가 없는 옛 기록을 고르는 필터 값

function labelOf(labels, value) {
  const code = Object.hasOwn(labels, value) ? value : 'unknown';
  return `${labels[code] ?? '확인 불가'}(${String(value ?? 'unknown')})`;
}

// 상세의 상태 한 줄: "확인 불가(unknown)"처럼 한국어 뜻과 원래 값을 붙여 쓰고 색으로도 구분한다.
function stateLine(name, labels, value, good) {
  const code = Object.hasOwn(labels, value) ? value : 'unknown';
  const line = node('p', `${name}: ${labelOf(labels, value)}`, `state state-${code === good ? 'ok' : code === 'unknown' ? 'empty' : 'error'}`);
  line.dataset.state = code;
  return line;
}

function koreanTime(at) {
  const time = Date.parse(at);
  return Number.isNaN(time) ? '시각 확인 불가' : new Date(time).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

function filterSelect(name, values, describe) {
  const label = node('label', `${name} `);
  const select = node('select');
  const all = node('option', '전체');
  all.value = 'all';
  select.append(all);
  for (const value of values) {
    const option = node('option', describe(value));
    option.value = value;
    select.append(option);
  }
  label.append(select);
  return { label, select };
}

function textRows(title, rows) {
  const box = node('div');
  box.append(node('h4', title));
  if (!Array.isArray(rows) || rows.length === 0) {
    box.append(node('p', `${title} 없음`));
    return box;
  }
  const list = node('ul');
  for (const row of rows) list.append(node('li', `${row?.id ?? 'ID 확인 불가'}: ${row?.text ?? ''}`));
  box.append(list);
  return box;
}

function eventDetail(event) {
  const detail = node('section', null, 'student-event-detail');
  detail.dataset.studentEventDetail = event.id;
  detail.append(
    node('h4', `${event.id} 상세`),
    node('p', `사건 ID: ${event.id}`),
    node('p', `업무 앱: ${event.appId ?? '앱 확인 불가(appId 없음)'}`),
    textRows('근거(evidence)', event.evidence),
    textRows('규칙(rules)', event.rules),
    node('h4', '상태(state)'),
    stateLine('접속 상태(access)', ACCESS_LABELS, event.state?.access, 'allowed'),
    stateLine('세션 상태(session)', SESSION_LABELS, event.state?.session, 'active'),
    stateLine('기기 상태(device)', DEVICE_LABELS, event.state?.device, 'compliant'),
  );
  // 16단계: 연결되지 않은 조치가 넘어온 경우에만 요청을 보내지 않는 비활성 안내 버튼을 둔다. 빈 배열이면 아무것도 만들지 않는다.
  const actions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
  if (actions.length > 0) {
    detail.append(node('h4', '조치'), node('p', '아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중이며, 버튼을 눌러도 요청을 보내지 않습니다.'));
    for (const action of actions) {
      const button = node('button', `${action} 미지원`);
      button.type = 'button';
      button.disabled = true;
      detail.append(button);
    }
  }
  return detail;
}

function renderEvents({ status, mode, data, error } = {}) {
  const root = node('div', null, 'student-events');
  if (mode != null && mode !== 'connected') root.append(node('p', `연결 모드: ${MODE_LABELS[mode] ?? MODE_LABELS.unknown}`, 'state state-empty'));
  root.append(node('p', '조회 범위: 본인의 최근 기록(최대 40건)과 서버에 저장된 XDR 경보입니다. 전체 직원 이력이나 실시간 탐지가 아닙니다.'));
  if (status === 'loading') {
    root.append(node('p', '불러오는 중…', 'state state-loading'));
    return root;
  }
  if (status === 'error') {
    const text = error?.code === 'CONTRACT_MISMATCH'
      ? `확인 불가: 기록 형식을 확인할 수 없어 목록을 표시하지 않습니다. ${error?.message ?? ''}`
      : `기록을 불러오지 못했습니다: ${error?.message ?? '서버 메시지 없음'}`;
    const line = node('p', text, 'state state-error');
    line.setAttribute('role', 'alert');
    root.append(line);
    return root;
  }
  if (status !== 'ok' || !Array.isArray(data)) {
    root.append(node('p', '확인 불가: 알 수 없는 상태입니다.', 'state state-empty'));
    return root;
  }
  if (data.length === 0) {
    root.append(node('p', '표시할 기록이 없습니다.', 'state state-empty'));
    return root;
  }

  // 원본 배열은 바꾸지 않고 복사본을 최신순으로 정렬한다.
  const events = [...data].sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0));
  const unique = (pick) => [...new Set(events.map(pick))];
  const kind = filterSelect('기록 종류', unique((e) => e.kind), (v) => labelOf(KIND_LABELS, v));
  const app = filterSelect('업무 앱', unique((e) => e.appId ?? NO_APP), (v) => (v === NO_APP ? '앱 확인 불가(appId 없음)' : v));
  const access = filterSelect('접속 상태', unique((e) => e.state?.access), (v) => labelOf(ACCESS_LABELS, v));
  const filters = node('div', null, 'student-event-filters');
  // CSP가 style 속성 문자열은 막지만 DOM의 style 속성 설정은 허용한다.
  Object.assign(filters.style, { display: 'flex', flexWrap: 'wrap', gap: '8px 16px' });
  filters.append(kind.label, app.label, access.label);
  const count = node('p');
  count.setAttribute('aria-live', 'polite');
  const list = node('ul');
  const detailArea = node('div');

  function draw() {
    const shown = events.filter((e) => (kind.select.value === 'all' || e.kind === kind.select.value)
      && (app.select.value === 'all' || (e.appId ?? NO_APP) === app.select.value)
      && (access.select.value === 'all' || e.state?.access === access.select.value));
    count.textContent = `표시 ${shown.length}건 / 받은 기록 ${events.length}건`;
    list.replaceChildren();
    detailArea.replaceChildren();
    if (shown.length === 0) list.append(node('li', '필터 조건에 맞는 기록이 없습니다.'));
    for (const event of shown) {
      const row = node('li');
      row.dataset.studentEventId = event.id;
      const button = node('button', `${event.id} 상세`);
      button.type = 'button';
      button.addEventListener('click', () => detailArea.replaceChildren(eventDetail(event)));
      row.append(
        node('p', `${event.id} · ${koreanTime(event.at)} (${event.at}) · ${labelOf(KIND_LABELS, event.kind)} · 앱: ${event.appId ?? '앱 확인 불가(appId 없음)'}`),
        node('p', event.summary ?? ''),
        button,
      );
      list.append(row);
    }
  }
  for (const { select } of [kind, app, access]) select.addEventListener('change', draw);
  draw();
  root.append(filters, count, list, detailArea);
  return root;
}

// 16단계: 알림·빈 상태·오류·진단 정보
const RETRY_GUIDE = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.';

// 불러오는 중·실패·빈 목록·목록을 서로 다른 문장으로 보여 준다. 매번 새로 그리므로 다시 불러와 성공하면 이전 실패 안내가 사라진다.
function listSection(title, what, emptyText, resource, renderItem) {
  const box = node('section');
  box.append(node('h3', title));
  if (resource?.mode != null && resource.mode !== 'connected') box.append(node('p', `연결 모드: ${MODE_LABELS[resource.mode] ?? MODE_LABELS.unknown}`, 'state state-empty'));
  if (resource?.status === 'loading') box.append(node('p', `${what} 불러오는 중…`, 'state state-loading'));
  else if (resource?.status === 'error') {
    const timeout = /TIMEOUT/.test(resource.error?.code ?? '');
    const line = node('p', `${what} 불러오지 못했습니다${timeout ? '(시간 초과)' : ''}: ${resource.error?.message ?? '서버 메시지 없음'} (${resource.error?.code ?? 'UNKNOWN'})`, 'state state-error');
    line.setAttribute('role', 'alert');
    box.append(line, node('p', RETRY_GUIDE));
  } else if (resource?.status === 'ok' && Array.isArray(resource.data)) {
    if (resource.data.length === 0) box.append(node('p', emptyText, 'state state-empty'));
    else {
      const list = node('ul');
      for (const item of resource.data) {
        const li = node('li');
        li.append(...renderItem(item));
        list.append(li);
      }
      box.append(list);
    }
  } else box.append(node('p', `${what} 확인 불가: 알 수 없는 상태입니다.`, 'state state-empty'));
  return box;
}

// 진단 결과에서 정해진 값만 고른다. 그 밖의 필드(인증·AI 설정 등)는 화면에도 복사에도 넣지 않는다.
function safeDiagnostics(data) {
  return {
    requestId: data?.requestId ?? null,
    component: data?.component ?? null,
    version: data?.version ?? null,
    checkedAt: data?.checkedAt ?? null,
    engineMode: data?.engine?.mode ?? null,
    engineCode: data?.engine?.code ?? null,
  };
}

function diagnosticsSection(resource) {
  const box = node('section');
  box.append(node('h3', '도움정보'), node('p', '도움 요청에 쓸 수 있도록 비밀이 없는 점검 값만 복사합니다. 복사 버튼을 누를 때만 복사하며 어디에도 전송하지 않습니다.'));
  const copy = node('button', '도움정보 복사');
  copy.type = 'button';
  copy.disabled = true;
  const result = node('p');
  result.setAttribute('aria-live', 'polite');
  const status = resource?.status;
  if (status === 'ok') {
    const safe = safeDiagnostics(resource.data);
    const list = node('dl');
    for (const [key, value] of [['requestId', safe.requestId], ['component', safe.component], ['version', safe.version], ['checkedAt', safe.checkedAt], ['engine.mode', safe.engineMode], ['engine.code', safe.engineCode]]) {
      list.append(node('dt', key), node('dd', value ?? '확인 불가'));
    }
    box.append(list);
    copy.disabled = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(safe, null, 2));
        result.textContent = '도움정보를 클립보드에 복사했습니다. 붙여 넣기 전에 내용을 직접 확인하세요.';
      } catch {
        result.textContent = '클립보드에 복사하지 못했습니다. 위 값을 직접 선택해 복사하세요.';
      }
    });
  } else if (status === 'loading') box.append(node('p', '도움정보 불러오는 중…', 'state state-loading'));
  else if (status === 'error') {
    const line = node('p', `도움정보를 불러오지 못했습니다: ${resource.error?.message ?? '서버 메시지 없음'} (${resource.error?.code ?? 'UNKNOWN'})`, 'state state-error');
    line.setAttribute('role', 'alert');
    box.append(line, node('p', '다시 시도는 아래 도움정보 영역의 도움정보 불러오기 버튼을 직접 누르세요.'));
  } else box.append(node('p', '도움정보를 아직 불러오지 않았습니다. 아래 도움정보 영역의 도움정보 불러오기 버튼을 누르면 이 칸에도 표시됩니다.', 'state state-empty'));
  box.append(copy, result);
  return box;
}

function renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
  const root = node('div', null, 'student-status');
  if (mode != null && mode !== 'connected') root.append(node('p', `연결 모드: ${MODE_LABELS[mode] ?? MODE_LABELS.unknown}`, 'state state-empty'));

  const alerts = node('section');
  alerts.append(node('h3', '알림'));
  if (!Array.isArray(notifications) || notifications.length === 0) alerts.append(node('p', '주의할 알림이 없습니다.', 'state state-ok'));
  else {
    const list = node('ul');
    for (const item of notifications) list.append(node('li', `[${item?.resource ?? '자료 확인 불가'}] ${item?.code ?? 'UNKNOWN'}: ${item?.message ?? ''}`));
    alerts.append(list);
  }

  root.append(
    alerts,
    listSection('등록 기기', '기기 목록을', '등록된 기기가 없습니다.', devices,
      (device) => [node('p', `${device?.label ?? '이름 확인 불가'} (ID: ${device?.id ?? '확인 불가'})`), statusLine('보안 상태', DEVICE_LABELS, device?.status)]),
    listSection('현재 세션', '세션 정보를', '현재 연결 없음: 검증된 세션이 없습니다.', sessions,
      (session) => [statusLine(`세션 ${session?.id ?? 'ID 확인 불가'}`, SESSION_LABELS, session?.status)]),
    node('p', '세션은 현재 검증된 연결 하나만 표시합니다. 지난 세션 목록이 아닙니다.'),
    diagnosticsSection(diagnostics),
  );
  return root;
}

export function createStudentView() {
  return {
    renderIdentity,
    renderDecision,
    renderEvents,
    renderStatus,
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
