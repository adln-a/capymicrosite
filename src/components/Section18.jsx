import { useRef, useState } from 'react';
import { MaterialIcon } from './icons.jsx';
import pennyChick from '../assets/Contact-Form-Penny.svg';
import contactPaperClip from '../assets/Contact-Paper-Clip.png';

// Content + exact colors/rotations transcribed from the reference export
// (Section 18 - Contact Form.html).
const CARDS = [
  {
    key: 'problem-statement',
    bg: 'bg-bg-blue',
    rotate: -1,
    heading: 'Submit a problem statement ✏️',
    body: "Tell us what challenges you're facing. We're always looking for new questions to explore together.",
    headingColor: 'text-body-inverted',
    bodyColor: 'text-body-inverted',
  },
  {
    key: 'collaborate',
    bg: 'bg-bg-yellow',
    rotate: 0,
    heading: 'Collaborate with us 👋🏻',
    body: "Whether it's co-design, testing, or research, we're open to partnerships that push for real change.",
    headingColor: 'text-heading-default',
    bodyColor: 'text-body-default',
  },
  {
    key: 'feedback',
    bg: 'bg-bg-light-blue',
    rotate: 1,
    heading: 'Share your thoughts 💭',
    body: "Got an idea, feedback, or something we missed? Let us know. We're listening.",
    headingColor: 'text-heading-default',
    bodyColor: 'text-body-default',
  },
  {
    key: 'stay-in-loop',
    bg: 'bg-bg-light-green',
    rotate: 0,
    heading: 'Stay in the loop 🔁',
    body: "Leave your email and we'll share project updates, new tools, and open calls for collaboration.",
    headingColor: 'text-heading-default',
    bodyColor: 'text-body-default',
  },
];

const SUBJECT_OPTIONS = [
  { value: 'problem-statement', label: "I'd like to submit a problem statement" },
  { value: 'collaborate', label: "I'd like to collaborate" },
  { value: 'feedback', label: "I'd like to share my feedback" },
  { value: 'stay-in-loop', label: "I'd like to stay in the loop" },
];

// Deliberately loose (non-RFC5322) -- good enough to catch obvious typos
// client-side; real format/deliverability enforcement belongs server-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD_ORDER = ['name', 'email', 'subject', 'message'];

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
// Web3Forms access keys are meant to be used client-side (the key scopes
// which form/inbox a submission lands in, not a secret credential) -- it
// still lives in .env rather than inline, purely for cleanliness.
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const EMPTY_VALUES = { name: '', email: '', subject: '', message: '', website: '' };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) {
    errors.email = 'Please enter your email.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!values.subject) errors.subject = 'Please select an option.';
  if (!values.message.trim()) errors.message = 'Please enter a message.';
  return errors;
}

function InfoCard({ card }) {
  // rounded-medium (16 base -> 24 at xl), not rounded-large (24 -> 32) --
  // cross-checked against the reference (Section 18 - Contact Form.html),
  // which shows these cards at border-radius:24px, matching radius-
  // medium's own xl value exactly, not radius-large's. rounded-large was
  // wrong at both tiers (32px XL instead of 24, 24px S instead of 16),
  // not just an S-specific miss.
  return (
    <div
      style={{ transform: `rotate(${card.rotate}deg)`, transformOrigin: 'top left' }}
      className={`flex h-[200px] flex-none flex-col items-start justify-between rounded-medium p-m sm:h-[273px] sm:flex-1 ${card.bg}`}
    >
      <h3 className={`heading-3 self-stretch ${card.headingColor}`}>{card.heading}</h3>
      <p className={`body-paragraph self-stretch ${card.bodyColor}`}>{card.body}</p>
    </div>
  );
}

function Hole() {
  return <span aria-hidden="true" className="h-[22px] w-[22px] flex-shrink-0 rounded-full bg-bg-red" />;
}

function HoleColumn() {
  // 6 holes total, unevenly grouped exactly as authored in the reference
  // (2 singles, a nested close pair, 2 more singles) spread across the
  // card's full height via justify-between -- not a plain evenly-spaced
  // row of 6.
  return (
    <div className="flex w-[24px] flex-shrink-0 flex-col items-start justify-between self-stretch">
      <Hole />
      <Hole />
      <div className="flex flex-col items-start justify-start gap-s">
        <Hole />
        <Hole />
      </div>
      <Hole />
      <Hole />
    </div>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  // role="alert" makes this an assertive live region -- screen readers
  // announce it the moment it mounts, no separate aria-live wrapper needed.
  return (
    <p id={id} role="alert" className="body-paragraph self-stretch text-body-error">
      {message}
    </p>
  );
}

function TextField({ id, label, type, value, onChange, error, placeholder, autoComplete, inputRef }) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col items-start justify-start gap-2xs self-stretch">
      {/* text-heading-red (pomegranate-700), not text-button-primary-orange
          -- capy-orange-a11y only reaches 3.69:1 against this form's pink
          background (it was tuned against white), and heading-4 is bold
          but only 16px, never large enough to drop the requirement below
          4.5:1. pomegranate-700 already clears pink at 4.64:1 (same fix
          already proven for headings/errors elsewhere), so it's reused
          here instead of inventing yet another custom orange shade.
          border-heading-red matches on the input below so the label and
          its underline still read as one visual unit. */}
      <label htmlFor={id} className="heading-4 self-stretch text-heading-red">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        required
        aria-required="true"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className="body-paragraph w-full self-stretch border-b border-heading-red bg-transparent py-s text-body-default placeholder:text-body-disabled focus:border-b-2 focus:border-primary-teal focus:outline-none"
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function SubjectField({ value, onChange, error, inputRef }) {
  const errorId = 'contact-subject-error';
  return (
    <div className="flex flex-col items-start justify-start gap-2xs self-stretch">
      <label htmlFor="contact-subject" className="heading-4 self-stretch text-heading-red">
        Subject
      </label>
      <div className="relative self-stretch">
        <select
          ref={inputRef}
          id="contact-subject"
          name="subject"
          required
          aria-required="true"
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`body-paragraph w-full appearance-none border-b border-heading-red bg-transparent py-s pr-2xl focus:border-b-2 focus:border-primary-teal focus:outline-none ${value ? 'text-body-default' : 'text-body-disabled'}`}
        >
          <option value="" disabled>
            Select one
          </option>
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Purely visual -- the element underneath is a real <select>, so
            this adds no semantics and needs none. text-heading-red to
            match the label/border this select shares -- not a contrast
            requirement (icons only need 3:1, and the old orange already
            cleared that), just keeping the three pieces visually paired. */}
        <MaterialIcon
          name="expand_more"
          size={24}
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-heading-red"
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function MessageField({ value, onChange, error, inputRef }) {
  const errorId = 'contact-message-error';
  return (
    <div className="flex flex-col items-start justify-start gap-xs self-stretch">
      <label htmlFor="contact-message" className="heading-4 self-stretch text-heading-red">
        Message
      </label>
      <div
        className="relative self-stretch rounded-medium border-2 border-transparent bg-bg-white p-m focus-within:border-primary-teal"
        style={{ height: '240px' }}
      >
        <textarea
          ref={inputRef}
          id="contact-message"
          name="message"
          required
          aria-required="true"
          value={value}
          onChange={onChange}
          placeholder="Enter your message"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className="body-paragraph h-full w-full resize-none border-none bg-transparent text-body-default placeholder:text-body-disabled focus:outline-none"
        />
        <img
          src={pennyChick}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-[20px] right-[24px] h-[48px] w-[47px]"
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export default function Section18({ sectionRef }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  // 'idle' | 'submitting' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const fieldRefs = {
    name: useRef(null),
    email: useRef(null),
    subject: useRef(null),
    message: useRef(null),
  };

  const updateField = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot tripped: a real visitor never sees or fills this field
    // (it's pushed off-screen, not disabled or removed from the tab
    // order), so a non-empty value means something filled every field
    // blindly. Bail out quietly rather than validating further -- no
    // network request, no status change, nothing that would tip off
    // whatever filled it.
    if (values.website.trim()) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalidKey = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalidKey) {
      fieldRefs[firstInvalidKey].current?.focus();
      return;
    }

    setStatus('submitting');

    // Web3Forms' own email/dashboard wants the human-readable option text,
    // not our internal option value.
    const subjectLabel = SUBJECT_OPTIONS.find((option) => option.value === values.subject)?.label ?? values.subject;

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: values.name,
          email: values.email,
          subject: subjectLabel,
          message: values.message,
          // Web3Forms' own server-side honeypot check (their expected
          // field name is "botcheck") -- a second, independent layer
          // behind the client-side bail-out above. Always false here,
          // since a filled honeypot already returns before this point.
          botcheck: false,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus('error');
        return;
      }

      setValues(EMPTY_VALUES);
      setErrors({});
      setStatus('success');
    } catch {
      // Network failure, etc. -- leave `values` untouched so the user
      // doesn't have to retype everything.
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative flex w-full flex-col items-start justify-end gap-m bg-bg-red px-page-margin-x py-page-margin-y"
    >
      {/* content-cap: the site-wide desktop content cap -- without it,
          both the card row (4 flex-1 cards, no max-width of their own)
          and the pink form box (self-stretch) grew to fill however wide
          the section happened to be at wide viewports, with nothing
          bounding either one. */}
      <div className="flex w-full flex-col items-start gap-m content-cap">
        <div className="flex flex-col items-start justify-start gap-m self-stretch">
          <h2 className="heading-2 self-stretch text-heading-inverted">Contact us</h2>
          <p className="body-paragraph self-stretch text-body-inverted">
            If you're an organisation, NGO, or advocate working on similar issues - we'd love to hear from you.
          </p>

          {/* Single stacked column below sm -- back to the original single
              flex row of 4 from sm up. */}
          <div className="flex w-full flex-col items-stretch justify-start gap-s self-stretch sm:flex-row sm:items-start">
            {CARDS.map((card) => (
              <InfoCard key={card.key} card={card} />
            ))}
          </div>
        </div>

        <div className="relative flex items-start justify-start gap-s self-stretch bg-bg-pink pb-l pl-s pr-l pt-l">
          <HoleColumn />

          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col items-start justify-start gap-m"
          >
            <TextField
              id="contact-name"
              label="Name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              value={values.name}
              onChange={updateField('name')}
              error={errors.name}
              inputRef={fieldRefs.name}
            />
            <TextField
              id="contact-email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={values.email}
              onChange={updateField('email')}
              error={errors.email}
              inputRef={fieldRefs.email}
            />
            <SubjectField value={values.subject} onChange={updateField('subject')} error={errors.subject} inputRef={fieldRefs.subject} />
            <MessageField value={values.message} onChange={updateField('message')} error={errors.message} inputRef={fieldRefs.message} />

            {/* Honeypot: real input, real label, present in the DOM and in
                normal tab order -- deliberately NOT hidden via aria-hidden,
                display:none, visibility:hidden, or tabindex=-1, since bots
                commonly detect and skip fields hidden that way. Pushed
                off-screen instead, which still fools naive bots without
                those tells. autoComplete="off" plus an unusual field name
                keep browser autofill from ever populating it for a real
                user who does tab through it. */}
            <div className="absolute -left-[9999px]">
              <label htmlFor="contact-website">Leave this field blank</label>
              <input
                type="text"
                id="contact-website"
                name="website"
                autoComplete="off"
                tabIndex={0}
                value={values.website}
                onChange={updateField('website')}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              aria-busy={status === 'submitting'}
              className="button-default inline-flex cursor-pointer items-center gap-2xs rounded-large bg-button-primary-orange px-m py-s text-button-inverted transition-colors duration-150 hover:bg-capy-orange-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-button-primary-orange"
            >
              {status === 'submitting' ? 'Sending...' : 'Submit'}
            </button>

            {status === 'success' && (
              <p role="status" className="body-paragraph self-stretch text-body-default">
                Thanks — we've received your message.
              </p>
            )}
            {status === 'error' && (
              <p role="alert" className="body-paragraph self-stretch text-body-error">
                Something went wrong and your message wasn't sent. Please try again.
              </p>
            )}
          </form>

          <img
            src={contactPaperClip}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ width: '135px', height: '72px', left: '-56px', top: '445px', transform: 'rotate(-90deg)', transformOrigin: 'top left' }}
          />
        </div>
      </div>
    </section>
  );
}
