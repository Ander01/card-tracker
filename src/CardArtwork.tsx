import { useEffect, useState } from 'react'

export function CardArtwork({ baseUrl, name, large = false }: { baseUrl?: string; name: string; large?: boolean }) {
  const [failedSource, setFailedSource] = useState<string>()
  const source = baseUrl ? `${baseUrl}/${large ? 'high' : 'low'}.webp` : undefined
  useEffect(() => setFailedSource(undefined), [source])
  return <div className={`card-artwork${large ? ' artwork-large' : ''}`}>
    {source && failedSource !== source
      ? <img src={source} alt={name} loading="lazy" width={large ? 600 : 245} height={large ? 825 : 337} onError={() => setFailedSource(source)} />
      : <p className="artwork-unavailable">Artwork unavailable<span>{name}</span></p>}
  </div>
}
