import { ImageResponse } from 'next/og';

export const alt = 'Pulso — Dashboard de indicadores económicos de Chile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const indicators = [
  { code: 'UF', value: '$39.412,87', trend: 'up' as const, delta: '+0,03%' },
  { code: 'Dólar', value: '$963,12', trend: 'down' as const, delta: '-0,21%' },
  { code: 'Euro', value: '$1.041,55', trend: 'up' as const, delta: '+0,14%' },
  { code: 'Cobre', value: 'US$6,17/lb', trend: 'up' as const, delta: '+0,52%' },
];

const trendColor = { up: '#34d399', down: '#f87171' };
const trendBg = { up: 'rgba(52, 211, 153, 0.12)', down: 'rgba(248, 113, 113, 0.12)' };

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0a0a0b',
        padding: '64px 72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#e9b949',
              color: '#171208',
              fontSize: 30,
              fontWeight: 700,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            P
          </div>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, color: '#f5f5f4' }}>
            Pulso
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 20, fontSize: 30, color: '#a8a29e' }}>
          Indicadores económicos de Chile en tiempo real
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {indicators.map((indicator) => (
          <div
            key={indicator.code}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              background: '#141416',
              border: '1px solid #26262a',
              borderRadius: 16,
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', fontSize: 24, color: '#a8a29e' }}>{indicator.code}</div>
            <div
              style={{
                display: 'flex',
                marginTop: 12,
                fontSize: 32,
                fontWeight: 700,
                color: '#f5f5f4',
              }}
            >
              {indicator.value}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: 20,
                fontWeight: 600,
                color: trendColor[indicator.trend],
                background: trendBg[indicator.trend],
                borderRadius: 999,
                padding: '4px 12px',
                alignSelf: 'flex-start',
              }}
            >
              {indicator.delta}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
