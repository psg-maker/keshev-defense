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

export function createStudentView() {
  return {
    renderIdentity,
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
