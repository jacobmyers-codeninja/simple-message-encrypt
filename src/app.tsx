import { useState } from 'preact/hooks'
import sodium from 'libsodium-wrappers-sumo'
import scrypt from 'scrypt-js'
import './app.css'

export function App() {
  const [salt, setSalt] = useState('')
  const [saltError, setSaltError] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [passphraseError, setPassphraseError] = useState('')
  const [nonce, setNonce] = useState('')
  const [nonceError, setNonceError] = useState('')
  const [message, setMessage] = useState('')
  const [encryptedMessage, setEncryptedMessage] = useState('')

  const updateState = (value: string, min: number, max: number, state: (value: string) => void, error: (value: string) => void) => {
    sodium.ready.then( () => {
      state(value)

      if(max < 0) max = 128

      const bytes = sodium.from_string(value)
      if (bytes.length < min) {
        error('Too short ('+min+')')
      } else if(bytes.length > max) {
        error('Too long, will be truncated ('+max+')')
      } else {
        error('')
      }
    })
  }

  const updateSalt = (value: string) => {
    updateState(value, sodium.crypto_pwhash_SALTBYTES, sodium.crypto_pwhash_SALTBYTES, setSalt, setSaltError)
  }

  const updatePassphrase = (value: string) => {
    updateState(value, sodium.crypto_pwhash_PASSWD_MIN, sodium.crypto_pwhash_PASSWD_MAX, setPassphrase, setPassphraseError)
  }

  const updateNonce = (value: string) => {
    updateState(value, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, setNonce, setNonceError)
  }

  const truncate = async (value: string, min: number, max: number): Promise<Uint8Array> => {
    await sodium.ready

    if (max < 0) max = 128
    if (value.length == 0) value = sodium.to_base64(sodium.randombytes_buf(max))

    if (value.length < min) {
      return truncate(value.concat(value), min, max)
    } else if (value.length > max) {
      return sodium.from_string(value.slice(-max))
    }

    return sodium.from_string(value)
  }

  const encryptMessage = async () => {
    await sodium.ready

    // Convert inputs to Uint8Array
    const saltBytes = await truncate(salt, sodium.crypto_pwhash_SALTBYTES, sodium.crypto_pwhash_SALTBYTES)
    if (sodium.to_string(saltBytes) !== salt) updateSalt(sodium.to_string(saltBytes))

    const passphraseBytes = await truncate(passphrase, sodium.crypto_pwhash_PASSWD_MIN, sodium.crypto_pwhash_PASSWD_MAX)
    if (sodium.to_string(passphraseBytes) !== salt) updatePassphrase(sodium.to_string(passphraseBytes))

    const nonceBytes = await truncate(nonce, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
    if (sodium.to_string(nonceBytes) !== salt) updateNonce(sodium.to_string(nonceBytes))

    const messageBytes = sodium.from_string(message)

    setEncryptedMessage("Encrypting...")

    scrypt.scrypt(
      passphraseBytes,
      saltBytes,
      16384,
      8,
      1,
      sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES
    ).then(key => {
      const encryptedBytes = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        messageBytes,
        null, // No additional data
        null,
        nonceBytes,
        key
      );

      setEncryptedMessage(sodium.to_base64(encryptedBytes));
    })
  }

  return (
    <>
      <h1>Simple Message Encrypter</h1>
      <div class="card">
        Salt:<br />
        <input onInput={e => updateSalt(e.currentTarget.value)} value={salt} /><br />
        { saltError !== '' && saltError}<br />

        Passphrase:<br />
        <textarea onInput={e => updatePassphrase(e.currentTarget.value)} value={passphrase} rows={4} cols={80} /><br />
        { passphraseError !== '' && passphraseError}<br />

        Nonce:<br />
        <textarea onInput={e => updateNonce(e.currentTarget.value)} value={nonce} rows={4} cols={80} /><br />
        { nonceError !== '' && nonceError}<br />

        Message:<br />
        <textarea onInput={e => setMessage(e.currentTarget.value)} rows={4} cols={80} /><br />
        <br />

        <button onClick={() => encryptMessage()}>Encrypt</button>
      </div>
      { encryptedMessage &&
        <>
          <p>Encrypted Message:</p>

          { encryptedMessage }
        </>
      }
    </>
  )
}
