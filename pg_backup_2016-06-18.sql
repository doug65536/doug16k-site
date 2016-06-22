--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.3
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: chatmsgs; Type: TABLE; Schema: public; Owner: chatuser
--

CREATE TABLE chatmsgs (
    id bigint NOT NULL,
    sender character varying(64),
    message character varying(4000),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE chatmsgs OWNER TO chatuser;

--
-- Name: chatmsgs_id_seq; Type: SEQUENCE; Schema: public; Owner: chatuser
--

CREATE SEQUENCE chatmsgs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE chatmsgs_id_seq OWNER TO chatuser;

--
-- Name: chatmsgs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chatuser
--

ALTER SEQUENCE chatmsgs_id_seq OWNED BY chatmsgs.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: chatuser
--

CREATE TABLE sessions (
    id bigint NOT NULL,
    expires timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE sessions OWNER TO chatuser;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: chatuser
--

CREATE SEQUENCE sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE sessions_id_seq OWNER TO chatuser;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chatuser
--

ALTER SEQUENCE sessions_id_seq OWNED BY sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: chatuser
--

CREATE TABLE users (
    id bigint NOT NULL,
    username character varying(32),
    salt character(64),
    password character(64),
    email character varying(254),
    verified boolean,
    verifytoken character(64),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "sessionId" bigint
);


ALTER TABLE users OWNER TO chatuser;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: chatuser
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO chatuser;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: chatuser
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY chatmsgs ALTER COLUMN id SET DEFAULT nextval('chatmsgs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY sessions ALTER COLUMN id SET DEFAULT nextval('sessions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: chatmsgs; Type: TABLE DATA; Schema: public; Owner: chatuser
--

COPY chatmsgs (id, sender, message, "createdAt", "updatedAt") FROM stdin;
1	user658428161	hi	2016-06-04 16:44:01.026-04	2016-06-04 16:44:01.026-04
2	user658428161	this is inserting records into a database now	2016-06-04 16:46:01.112-04	2016-06-04 16:46:01.112-04
3	user658558893	ok 	2016-06-04 16:46:23.169-04	2016-06-04 16:46:23.169-04
4	user658558893	consecutive messages	2016-06-04 16:46:33.989-04	2016-06-04 16:46:33.989-04
5	user658701586	preserved	2016-06-04 16:48:36.336-04	2016-06-04 16:48:36.336-04
6	user658793428	let's see if the disk space goes crazy	2016-06-04 16:51:58.459-04	2016-06-04 16:51:58.459-04
7	user659016219	one	2016-06-04 16:53:50.107-04	2016-06-04 16:53:50.107-04
8	user659016219	two	2016-06-04 16:53:51.217-04	2016-06-04 16:53:51.217-04
9	user659016219	three	2016-06-04 16:53:52.566-04	2016-06-04 16:53:52.566-04
10	user659016219	four	2016-06-04 16:53:54.657-04	2016-06-04 16:53:54.657-04
11	user659016219	five	2016-06-04 16:53:58.244-04	2016-06-04 16:53:58.244-04
12	user659016219	six	2016-06-04 16:54:01.451-04	2016-06-04 16:54:01.451-04
13	user659016219	seven	2016-06-04 16:54:03.039-04	2016-06-04 16:54:03.039-04
14	user659016219	eight	2016-06-04 16:54:04.298-04	2016-06-04 16:54:04.298-04
15	user659016219	nine	2016-06-04 16:54:05.969-04	2016-06-04 16:54:05.969-04
16	user659016219	ten	2016-06-04 16:54:07.068-04	2016-06-04 16:54:07.068-04
17	user659016219	eleven	2016-06-04 16:54:08.869-04	2016-06-04 16:54:08.869-04
18	user659016219	twelve	2016-06-04 16:54:11.38-04	2016-06-04 16:54:11.38-04
19	user659016219	thirteen	2016-06-04 16:54:14.762-04	2016-06-04 16:54:14.762-04
20	user659978033	order	2016-06-04 17:13:45.91-04	2016-06-04 17:13:45.91-04
21	user659978033	delay	2016-06-04 17:17:46.116-04	2016-06-04 17:17:46.116-04
22	user659978033	------------	2016-06-04 17:21:46.246-04	2016-06-04 17:21:46.246-04
23	user659978034	a	2016-06-04 21:57:49.99-04	2016-06-04 21:57:49.99-04
24	user659978034	?	2016-06-04 22:00:10.086-04	2016-06-04 22:00:10.086-04
25	user677573784	?	2016-06-04 22:03:03.924-04	2016-06-04 22:03:03.924-04
26	user677573784	a	2016-06-04 22:06:42.691-04	2016-06-04 22:06:42.691-04
27	user677573784	?	2016-06-04 22:06:45.509-04	2016-06-04 22:06:45.509-04
28	user677573784	quick now	2016-06-04 22:06:50.537-04	2016-06-04 22:06:50.537-04
29	user677794597	yes	2016-06-04 22:08:50.731-04	2016-06-04 22:08:50.731-04
30	user677794597	a	2016-06-04 22:09:10.062-04	2016-06-04 22:09:10.062-04
31	user677794597	no	2016-06-04 22:09:13.55-04	2016-06-04 22:09:13.55-04
32	user677794597	no	2016-06-04 22:09:16.042-04	2016-06-04 22:09:16.042-04
33	user677794597	no again :(	2016-06-04 22:09:19.334-04	2016-06-04 22:09:19.334-04
34	user677794597	yes	2016-06-04 22:09:21.234-04	2016-06-04 22:09:21.234-04
35	user677794597	yes again :)	2016-06-04 22:09:24.571-04	2016-06-04 22:09:24.571-04
36	user677794597	works?	2016-06-04 22:09:27.608-04	2016-06-04 22:09:27.608-04
37	user678007222	yes works	2016-06-04 22:10:20.684-04	2016-06-04 22:10:20.684-04
38	user678024316	yes database works	2016-06-04 22:12:35.971-04	2016-06-04 22:12:35.971-04
39	user678024443	really works	2016-06-04 22:14:02.595-04	2016-06-04 22:14:02.595-04
40	doug	new name	2016-06-04 22:47:38.985-04	2016-06-04 22:47:38.985-04
41	doug	why	2016-06-04 22:48:04.642-04	2016-06-04 22:48:04.642-04
42	user678244795yay	why	2016-06-04 22:48:07.696-04	2016-06-04 22:48:07.696-04
43	user678244795yay	oh	2016-06-04 22:48:14.392-04	2016-06-04 22:48:14.392-04
44	user678244795yay	it works	2016-06-04 22:48:16.478-04	2016-06-04 22:48:16.478-04
45	doug	database really works	2016-06-04 22:51:29.039-04	2016-06-04 22:51:29.039-04
46	doug	The Dunning–Kruger effect is a cognitive bias in which relatively unskilled persons suffer illusory superiority, mistakenly assessing their ability to be much higher than it really is. Dunning and Kruger attributed this bias to a metacognitive inability of the unskilled to recognize their own ineptitude and evaluate their own ability accurately. Their research also suggests corollaries: highly skilled individuals may underestimate their relative competence and may erroneously assume that tasks which are easy for them are also easy for others.[1]	2016-06-04 22:51:52.24-04	2016-06-04 22:51:52.24-04
47	doug	The bias was first experimentally observed by David Dunning and Justin Kruger of Cornell University in 1999. They postulated that the effect is the result of internal illusion in the unskilled, and external misperception in the skilled: "The miscalibration of the incompetent stems from an error about the self, whereas the miscalibration of the highly competent stems from an error about others."[1]	2016-06-04 22:52:01.32-04	2016-06-04 22:52:01.32-04
48	doug	Illusory superiority is a cognitive bias whereby individuals overestimate their own qualities and abilities, relative to others. This is evident in a variety of areas including intelligence, performance on tasks or tests, and the possession of desirable characteristics or personality traits. It is one of many positive illusions relating to the self, and is a phenomenon studied in social psychology.	2016-06-04 22:54:55.076-04	2016-06-04 22:54:55.076-04
49	doug	Illusory superiority is often referred to as the above average effect. Other terms include superiority bias, leniency error, sense of relative superiority, the primus inter pares effect,[1] and the Lake Wobegon effect (named after Garrison Keillor's fictional town where "all the children are above average").[2] The phrase "illusory superiority" was first used by Van Yperen and Buunk in 1991.[1]	2016-06-04 22:55:01.065-04	2016-06-04 22:55:01.065-04
50	doug	Positive illusions are unrealistically favorable attitudes that people have towards themselves or to people that are close to them. Positive illusions are a form of self-deception or self-enhancement that feel good, maintain self-esteem or stave off discomfort, at least in the short term. There are three broad kinds: inflated assessment of one's own abilities, unrealistic optimism about the future, and an illusion of control.[1] The term "positive illusions" originates in a 1988 paper by Taylor and Brown.[1] "Taylor and Brown's (1988) model of mental health maintains that certain positive illusions are highly prevalent in normal thought and predictive of criteria traditionally associated with mental health."[2]	2016-06-04 22:55:23.518-04	2016-06-04 22:55:23.518-04
51	freshguy	hi	2016-06-04 23:15:53.266-04	2016-06-04 23:15:53.266-04
52	user685678104	new	2016-06-05 00:18:56.753-04	2016-06-05 00:18:56.753-04
53	user685678104	new messages animate	2016-06-05 00:19:03.949-04	2016-06-05 00:19:03.949-04
54	user685678105	messages	2016-06-05 00:19:33.774-04	2016-06-05 00:19:33.774-04
55	user685678105	new messages animate	2016-06-05 00:19:45.788-04	2016-06-05 00:19:45.788-04
56	user685678191	a	2016-06-05 00:24:14.62-04	2016-06-05 00:24:14.62-04
57	doug	hi	2016-06-05 00:26:08.763-04	2016-06-05 00:26:08.763-04
58	doug	is the animation okay?	2016-06-05 00:26:19.199-04	2016-06-05 00:26:19.199-04
59	doug	is the font okay?	2016-06-05 00:35:53.486-04	2016-06-05 00:35:53.486-04
60	user685678192	font working in input?	2016-06-05 00:37:28.601-04	2016-06-05 00:37:28.601-04
61	user685678192	test	2016-06-05 00:42:56.369-04	2016-06-05 00:42:56.369-04
62	user685678192	test2	2016-06-05 00:42:59.906-04	2016-06-05 00:42:59.906-04
63	user685678192	animate?	2016-06-05 00:43:05.77-04	2016-06-05 00:43:05.77-04
64	user685678192	animated too?	2016-06-05 00:43:11.439-04	2016-06-05 00:43:11.439-04
65	user685678132	this is the font, yes	2016-06-05 01:47:26.037-04	2016-06-05 01:47:26.037-04
66	test2	surprise	2016-06-05 02:40:37.696-04	2016-06-05 02:40:37.696-04
67	test	it does not preserve name properly yet	2016-06-05 02:42:22.278-04	2016-06-05 02:42:22.278-04
68	test5	name	2016-06-05 02:51:16.261-04	2016-06-05 02:51:16.261-04
69	test6	6 now	2016-06-05 02:54:14.74-04	2016-06-05 02:54:14.74-04
70	test6	stays now	2016-06-05 02:54:31.818-04	2016-06-05 02:54:31.818-04
71	test6	still works?	2016-06-05 03:06:19.891-04	2016-06-05 03:06:19.891-04
72	test6	tes	2016-06-05 03:06:21.205-04	2016-06-05 03:06:21.205-04
73	test6	yes	2016-06-05 03:06:23.173-04	2016-06-05 03:06:23.173-04
74	test6	need edit	2016-06-05 03:06:28.166-04	2016-06-05 03:06:28.166-04
75	test6	need some markdown	2016-06-05 03:07:10.823-04	2016-06-05 03:07:10.823-04
76	user693431823	a	2016-06-05 03:45:38.791-04	2016-06-05 03:45:38.791-04
77	user611417461	hey.	2016-06-05 09:49:17.458-04	2016-06-05 09:49:17.458-04
78	user611417461	nice animation :D	2016-06-05 09:49:23.105-04	2016-06-05 09:49:23.105-04
79	doug	:D	2016-06-05 11:54:48.65-04	2016-06-05 11:54:48.65-04
80	doug	robustness	2016-06-05 13:08:18.611-04	2016-06-05 13:08:18.611-04
81	doug	sent offline	2016-06-05 13:51:48.39-04	2016-06-05 13:51:48.39-04
82	doug	yay, retry and disconnect recovery works!	2016-06-05 13:52:06.398-04	2016-06-05 13:52:06.398-04
83	doug	with exponential backoff so it won't spam the server when there are many users	2016-06-05 13:52:36.692-04	2016-06-05 13:52:36.692-04
84	doug	but quick recovery for transient errors	2016-06-05 13:52:56.424-04	2016-06-05 13:52:56.424-04
85	doug	profiling send message	2016-06-05 13:58:46.77-04	2016-06-05 13:58:46.77-04
86	user685678232	I think it is too fast to get any profile samples in the code	2016-06-05 14:15:24.528-04	2016-06-05 14:15:24.528-04
87	doug	still need to see why server side wait timeout doesn't fire, it shouldn't need to rely on client side timeout	2016-06-05 14:38:59.847-04	2016-06-05 14:38:59.847-04
88	doug	client side times out 6 seconds after server should have timed out	2016-06-05 14:39:22.821-04	2016-06-05 14:39:22.821-04
89	doug	timeout fixed, there is an undocumented timeout in express, 2 minutes by default.	2016-06-05 20:40:39.997-04	2016-06-05 20:40:39.997-04
90	doug	still works after several cycles of long pool reconnecting	2016-06-05 20:52:48.157-04	2016-06-05 20:52:48.157-04
91	doug	poll	2016-06-05 22:04:42.426-04	2016-06-05 22:04:42.426-04
92	doug	new	2016-06-05 22:19:50.199-04	2016-06-05 22:19:50.199-04
93	doug	new 2	2016-06-05 22:20:49.799-04	2016-06-05 22:20:49.799-04
94	doug	k that worked	2016-06-05 22:20:55.885-04	2016-06-05 22:20:55.885-04
95	doug	k new lines still work?	2016-06-05 22:21:43.703-04	2016-06-05 22:21:43.703-04
96	doug	new ?	2016-06-05 22:23:04.574-04	2016-06-05 22:23:04.574-04
97	doug	all	2016-06-05 22:24:51.399-04	2016-06-05 22:24:51.399-04
98	doug	animated	2016-06-05 22:25:33.292-04	2016-06-05 22:25:33.292-04
99	doug	new	2016-06-05 22:31:05.896-04	2016-06-05 22:31:05.896-04
100	doug	new2	2016-06-05 22:32:23.302-04	2016-06-05 22:32:23.302-04
101	doug	new3	2016-06-05 22:33:23.324-04	2016-06-05 22:33:23.324-04
102	doug	new	2016-06-05 22:33:39.177-04	2016-06-05 22:33:39.177-04
103	doug	lol	2016-06-05 22:33:52.558-04	2016-06-05 22:33:52.558-04
104	doug	e	2016-06-05 22:34:11.689-04	2016-06-05 22:34:11.689-04
105	doug	new	2016-06-05 22:36:26.723-04	2016-06-05 22:36:26.723-04
106	doug	new	2016-06-05 22:37:01.768-04	2016-06-05 22:37:01.768-04
107	doug	new4	2016-06-05 22:37:11.688-04	2016-06-05 22:37:11.688-04
108	doug	new	2016-06-05 22:39:48.064-04	2016-06-05 22:39:48.064-04
109	doug	cmon	2016-06-05 22:39:53.127-04	2016-06-05 22:39:53.127-04
110	doug	new	2016-06-05 22:41:41.533-04	2016-06-05 22:41:41.533-04
111	doug	from left	2016-06-05 22:42:06.588-04	2016-06-05 22:42:06.588-04
112	doug	is that better or worse? D:	2016-06-05 22:42:24.828-04	2016-06-05 22:42:24.828-04
113	doug	new	2016-06-05 22:42:50.158-04	2016-06-05 22:42:50.158-04
114	doug	hello	2016-06-05 22:43:44.61-04	2016-06-05 22:43:44.61-04
115	doug	neat	2016-06-05 22:43:49.535-04	2016-06-05 22:43:49.535-04
116	doug	that's much better	2016-06-05 22:43:59.991-04	2016-06-05 22:43:59.991-04
117	user685678109	trying in firefox	2016-06-05 22:45:17.619-04	2016-06-05 22:45:17.619-04
118	user685678109	lol, no animation?	2016-06-05 22:45:24.652-04	2016-06-05 22:45:24.652-04
119	user685678109	pfff	2016-06-05 22:45:27.828-04	2016-06-05 22:45:27.828-04
120	user685678109	vendor prefixes	2016-06-05 22:45:33.842-04	2016-06-05 22:45:33.842-04
121	user685678109	new	2016-06-05 22:45:55.862-04	2016-06-05 22:45:55.862-04
122	user685678109	yeah, fixed in firefox now	2016-06-05 22:46:01.982-04	2016-06-05 22:46:01.982-04
123	user685678109	animate	2016-06-05 22:46:05.974-04	2016-06-05 22:46:05.974-04
124	doug	animate again	2016-06-05 22:50:34.079-04	2016-06-05 22:50:34.079-04
125	doug	new	2016-06-05 22:50:45.202-04	2016-06-05 22:50:45.202-04
126	user685678109	firefox css animation is laughable... it must be software rendering or something	2016-06-05 22:56:22.326-04	2016-06-05 22:56:22.326-04
127	doug	looks perfect in chrome	2016-06-05 22:56:31.782-04	2016-06-05 22:56:31.782-04
128	doug	gotta add authentication	2016-06-05 22:56:52.138-04	2016-06-05 22:56:52.138-04
129	user770071837	https works	2016-06-05 23:49:43.28-04	2016-06-05 23:49:43.28-04
130	doug	oops	2016-06-05 23:49:55.89-04	2016-06-05 23:49:55.89-04
131	doug	https works :)	2016-06-05 23:50:02.148-04	2016-06-05 23:50:02.148-04
132	doug	now http auto-redirects to https	2016-06-06 00:26:58.478-04	2016-06-06 00:26:58.478-04
133	doug	still needs dhparam 	2016-06-06 00:27:25.958-04	2016-06-06 00:27:25.958-04
134	doug	to get A+ security rating	2016-06-06 00:27:37.075-04	2016-06-06 00:27:37.075-04
135	user784276173	Android screws up the width of the text box 	2016-06-06 13:34:16.251-04	2016-06-06 13:34:16.251-04
136	doug	dhparam done	2016-06-06 16:53:16.189-04	2016-06-06 16:53:16.189-04
137	doug	still needs ticketkeys	2016-06-06 16:53:20.651-04	2016-06-06 16:53:20.651-04
138	doug	:(	2016-06-07 00:57:51.827-04	2016-06-07 00:57:51.827-04
139	user858424782	hey	2016-06-07 13:55:54.055-04	2016-06-07 13:55:54.055-04
140	user858424782	:)	2016-06-07 13:56:16.198-04	2016-06-07 13:56:16.198-04
141	user858424782	nice	2016-06-07 13:56:18.145-04	2016-06-07 13:56:18.145-04
142	user858424782	cool.	2016-06-07 13:56:22.585-04	2016-06-07 13:56:22.585-04
143	doug	yeah, I should speed it up eh?	2016-06-07 13:57:14.65-04	2016-06-07 13:57:14.65-04
144	user858424782	ye	2016-06-07 13:59:54.292-04	2016-06-07 13:59:54.292-04
145	user858424782	and sometimes it doesn't animate	2016-06-07 13:59:59.657-04	2016-06-07 13:59:59.657-04
146	user858424782	:D	2016-06-07 14:00:01.198-04	2016-06-07 14:00:01.198-04
147	user858424782	it's weird.	2016-06-07 14:00:05.538-04	2016-06-07 14:00:05.538-04
148	user858424782	sometimes it's instantly there	2016-06-07 14:00:12.498-04	2016-06-07 14:00:12.498-04
149	user858424782	:D	2016-06-07 14:00:18.318-04	2016-06-07 14:00:18.318-04
150	doug	on firefox?	2016-06-07 14:00:39.548-04	2016-06-07 14:00:39.548-04
151	user858424782	yeah	2016-06-07 14:00:54.38-04	2016-06-07 14:00:54.38-04
152	doug	firefox is acting weird for the animation	2016-06-07 14:00:59.402-04	2016-06-07 14:00:59.402-04
153	user858424782	:D	2016-06-07 14:02:54.109-04	2016-06-07 14:02:54.109-04
154	user858424782	yeah	2016-06-07 14:02:56.681-04	2016-06-07 14:02:56.681-04
155	doug	maybe I should use keyframes instead of transition. firefox doesn't seem to like it when I suddenly add a class that causes a transition right after it is created	2016-06-07 14:02:58.594-04	2016-06-07 14:02:58.594-04
156	doug	works exactly as intended in chrome though 	2016-06-07 14:03:27.875-04	2016-06-07 14:03:27.875-04
157	user858424782	let me try chrome.	2016-06-07 14:04:02.116-04	2016-06-07 14:04:02.116-04
158	user858424746	hey	2016-06-07 14:04:26.617-04	2016-06-07 14:04:26.617-04
159	user858424746	yeah it works better in Chrome	2016-06-07 14:04:32.128-04	2016-06-07 14:04:32.128-04
160	user858424746	:D	2016-06-07 14:04:34.016-04	2016-06-07 14:04:34.016-04
161	doug-firefox	test	2016-06-07 17:32:16.769-04	2016-06-07 17:32:16.769-04
162	doug-firefox	test2	2016-06-07 17:32:23.22-04	2016-06-07 17:32:23.22-04
163	doug-firefox	test3	2016-06-07 17:46:23.798-04	2016-06-07 17:46:23.798-04
164	doug-firefox	test4	2016-06-07 17:50:33.419-04	2016-06-07 17:50:33.419-04
165	doug-firefox	test5	2016-06-07 17:51:14.164-04	2016-06-07 17:51:14.164-04
166	doug-firefox	test6	2016-06-07 17:51:26.276-04	2016-06-07 17:51:26.276-04
167	doug-firefox	test7	2016-06-07 17:51:45.909-04	2016-06-07 17:51:45.909-04
168	doug	test chrome	2016-06-07 17:52:18.492-04	2016-06-07 17:52:18.492-04
169	doug	test	2016-06-07 17:55:32.308-04	2016-06-07 17:55:32.308-04
170	doug-firefox	test2	2016-06-07 18:27:08.268-04	2016-06-07 18:27:08.268-04
171	7617a xroidsux3	Android chrome sucks	2016-06-07 18:47:01.592-04	2016-06-07 18:47:01.592-04
172	doug	I fixed my W key	2016-06-07 22:21:40.007-04	2016-06-07 22:21:40.007-04
173	doug-firefox	http://www.quikfixlaptopkeys.com/	2016-06-07 22:28:08.403-04	2016-06-07 22:28:08.403-04
174	doug	why ewse would wou wind weasons woo woose W wa wot	2016-06-08 01:37:14.558-04	2016-06-08 01:37:14.558-04
175	doug	W is actually not used very often, except in JS it gets a bit annoying when I have to type window	2016-06-08 01:38:06.863-04	2016-06-08 01:38:06.863-04
176	doug	Flush cache reload page load for this page, on dialup (48kbps down, 30kbps up)is 10sec. Subsequent loads are 1.6sec, with 2KB transferred. Everything is cacheable, including chat message data	2016-06-08 03:04:48.972-04	2016-06-08 03:04:48.972-04
177	doug	I force realign the requests so the next one begins on a multiple of 64, and the limit per response is 64 messages. This causes requests to realign and be the same and cacheable	2016-06-08 03:05:46.831-04	2016-06-08 03:05:46.831-04
178	doug	it's neat when it is limited to dialup speed, I can see it disable the chat input for a moment while the transfer is pending	2016-06-08 03:07:24.242-04	2016-06-08 03:07:24.242-04
179	doug	test	2016-06-08 20:07:31.772-04	2016-06-08 20:07:31.772-04
180	doug	animation is perfect now?	2016-06-08 20:07:48.464-04	2016-06-08 20:07:48.464-04
181	doug-firefox	yay! I have figured out how to make complex contenteditable editors!	2016-06-09 04:20:44.57-04	2016-06-09 04:20:44.57-04
182	user858424782	testing.	2016-06-09 16:57:43.231-04	2016-06-09 16:57:43.231-04
183	user858424782	yep	2016-06-09 16:57:44.72-04	2016-06-09 16:57:44.72-04
184	user858424782	it is better in Firefox now	2016-06-09 16:57:48.366-04	2016-06-09 16:57:48.366-04
185	user858424782	:)	2016-06-09 16:57:49.159-04	2016-06-09 16:57:49.159-04
186	doug	cool	2016-06-09 16:58:09.014-04	2016-06-09 16:58:09.014-04
187	user858424782	yeah it's pretty cool :)	2016-06-09 16:58:57.133-04	2016-06-09 16:58:57.133-04
188	doug	I need to add "rooms", and add cursor-up-to-edit and add deletion	2016-06-09 16:59:21.139-04	2016-06-09 16:59:21.139-04
189	user858424782	yep :D	2016-06-09 17:02:32.622-04	2016-06-09 17:02:32.622-04
190	user858424782	then I can use the app	2016-06-09 17:02:43.076-04	2016-06-09 17:02:43.076-04
191	user858424782	also make a integration function so we can integrate to our own sites.	2016-06-09 17:02:52.834-04	2016-06-09 17:02:52.834-04
192	doug	yeah, it already is fairly modular, one source file for the ajax and stuff, and one for the database	2016-06-09 17:04:10.705-04	2016-06-09 17:04:10.705-04
193	doug	and a helper module for the interprocess communication	2016-06-09 17:04:29.91-04	2016-06-09 17:04:29.91-04
194	user858424782	haha I think it needs a graphical overhaul :P	2016-06-09 17:05:08.238-04	2016-06-09 17:05:08.238-04
195	user858424782	sorry to say.	2016-06-09 17:05:12.557-04	2016-06-09 17:05:12.557-04
196	doug	what part is bad?	2016-06-09 17:05:24.785-04	2016-06-09 17:05:24.785-04
197	user858424782	I know you are not a graphical designer :P	2016-06-09 17:05:25.728-04	2016-06-09 17:05:25.728-04
198	user858424782	the boxes look a bit weird I think.	2016-06-09 17:05:36.71-04	2016-06-09 17:05:36.71-04
199	user858424782	the boxes containing the messages	2016-06-09 17:05:43.051-04	2016-06-09 17:05:43.051-04
200	doug	yeah. what do you suggest? no box? a background?	2016-06-09 17:06:02.901-04	2016-06-09 17:06:02.901-04
201	user858424782	maybe try without boxes.	2016-06-09 17:06:49.454-04	2016-06-09 17:06:49.454-04
202	doug	refresh	2016-06-09 17:07:53.395-04	2016-06-09 17:07:53.395-04
203	doug	I should make your own messages slightly different right?	2016-06-09 17:08:38.311-04	2016-06-09 17:08:38.311-04
204	doug	I basically made it similar to stackoverflow chat	2016-06-09 17:09:26.599-04	2016-06-09 17:09:26.599-04
205	user858424782	too much space between the messages.	2016-06-09 17:09:58.803-04	2016-06-09 17:09:58.803-04
206	doug	better?	2016-06-09 17:10:17.67-04	2016-06-09 17:10:17.67-04
207	user858424782	I want an nick autocompletion function on tab.	2016-06-09 17:10:20.121-04	2016-06-09 17:10:20.121-04
208	doug	yeah, need dings @user<tab>	2016-06-09 17:10:32.559-04	2016-06-09 17:10:32.559-04
209	user858424782	I meant the space above each message.	2016-06-09 17:10:33.749-04	2016-06-09 17:10:33.749-04
210	doug	that is 0 0 margin padding	2016-06-09 17:10:58.327-04	2016-06-09 17:10:58.327-04
211	user858424782	maybe a timestamp would be nice as well.	2016-06-09 17:11:00.803-04	2016-06-09 17:11:00.803-04
212	user858424782	ok make some more space between nick and message 	2016-06-09 17:11:14.65-04	2016-06-09 17:11:14.65-04
213	user858424782	horizontally	2016-06-09 17:11:17.937-04	2016-06-09 17:11:17.937-04
214	user858424782	make more space	2016-06-09 17:11:23.45-04	2016-06-09 17:11:23.45-04
215	doug	try that	2016-06-09 17:11:45.701-04	2016-06-09 17:11:45.701-04
216	user858424782	a bit more.	2016-06-09 17:11:59.042-04	2016-06-09 17:11:59.042-04
217	doug	I need to adjust the animation a bit - dont worry about the moving down briefly	2016-06-09 17:12:05.949-04	2016-06-09 17:12:05.949-04
218	doug	ok	2016-06-09 17:12:08.4-04	2016-06-09 17:12:08.4-04
219	user858424782	from the right side of the nick to the left side of the message	2016-06-09 17:12:18.396-04	2016-06-09 17:12:18.396-04
220	doug	oops, adjusting wrong thing... 1 sec	2016-06-09 17:12:35.43-04	2016-06-09 17:12:35.43-04
221	doug	like that?	2016-06-09 17:12:54.95-04	2016-06-09 17:12:54.95-04
222	doug	I should right justify the name right?	2016-06-09 17:13:01.237-04	2016-06-09 17:13:01.237-04
223	user858424782	yeah and make some left padding on the nick	2016-06-09 17:13:41.931-04	2016-06-09 17:13:41.931-04
224	user858424782	right now it's glued to the edge of the screen	2016-06-09 17:13:52.593-04	2016-06-09 17:13:52.593-04
225	doug	yeah	2016-06-09 17:14:09.8-04	2016-06-09 17:14:09.8-04
226	doug	better?	2016-06-09 17:14:40.605-04	2016-06-09 17:14:40.605-04
227	doug	I also fixed animation for new size	2016-06-09 17:14:50.017-04	2016-06-09 17:14:50.017-04
228	user858424782	yeah that is better.	2016-06-09 17:14:52.989-04	2016-06-09 17:14:52.989-04
229	user858424782	I want to be able to click on each message and then the timestamp should display	2016-06-09 17:15:13.086-04	2016-06-09 17:15:13.086-04
230	doug	display how?	2016-06-09 17:15:37.21-04	2016-06-09 17:15:37.21-04
231	doug	tooltip?	2016-06-09 17:15:48.878-04	2016-06-09 17:15:48.878-04
232	doug	on hover? or click and pop up a thing?	2016-06-09 17:16:00.807-04	2016-06-09 17:16:00.807-04
233	user858424782	not a tooltip... 	2016-06-09 17:16:01.451-04	2016-06-09 17:16:01.451-04
234	user858424782	wait	2016-06-09 17:16:05.694-04	2016-06-09 17:16:05.694-04
235	doug	needs a pull down menu on each message right?	2016-06-09 17:16:16.869-04	2016-06-09 17:16:16.869-04
236	user858424782	yeah that could also work.	2016-06-09 17:16:30.054-04	2016-06-09 17:16:30.054-04
237	user858424782	I want to be able to edit my message.	2016-06-09 17:16:36.452-04	2016-06-09 17:16:36.452-04
238	user858424782	Like on Slack	2016-06-09 17:16:49.328-04	2016-06-09 17:16:49.328-04
239	doug	yeah, people expect cursor-up-to-edit	2016-06-09 17:16:51.441-04	2016-06-09 17:16:51.441-04
240	doug	is that how slack does it?	2016-06-09 17:17:01.895-04	2016-06-09 17:17:01.895-04
241	user858424782	yep.	2016-06-09 17:17:11.426-04	2016-06-09 17:17:11.426-04
242	user858424782	I am pretty sure that is the Slack way.	2016-06-09 17:17:19.93-04	2016-06-09 17:17:19.93-04
243	user858424782	and that's also the Skype way you know :d	2016-06-09 17:17:27.207-04	2016-06-09 17:17:27.207-04
244	doug	does slack have a time limit?	2016-06-09 17:17:31.714-04	2016-06-09 17:17:31.714-04
245	user858424782	brb	2016-06-09 17:17:33.299-04	2016-06-09 17:17:33.299-04
246	doug	yeah skype lets you do last one only though	2016-06-09 17:17:40.468-04	2016-06-09 17:17:40.468-04
247	user858424782	brb though.	2016-06-09 17:17:55.688-04	2016-06-09 17:17:55.688-04
248	doug	ya np	2016-06-09 17:17:59.287-04	2016-06-09 17:17:59.287-04
249	doug	stackoverflow makes the input background go yellow when you are editing a message	2016-06-09 17:23:51.914-04	2016-06-09 17:23:51.914-04
250	doug	I have to do the authentication though, since I want it to be impossible to edit another person's message	2016-06-09 17:24:22.092-04	2016-06-09 17:24:22.092-04
251	user858424782	yeah.	2016-06-09 17:25:27.885-04	2016-06-09 17:25:27.885-04
252	doug	but allow anonymous users too I guess	2016-06-09 17:26:11.411-04	2016-06-09 17:26:11.411-04
253	doug	the way freenode does it, a room can require a real account, or it can allow anonymous people that didn't reply to the registration and didn't give an email for that matter	2016-06-09 17:26:45.619-04	2016-06-09 17:26:45.619-04
254	user858424782	brb	2016-06-09 17:26:46.044-04	2016-06-09 17:26:46.044-04
255	doug	ok	2016-06-09 17:26:49.527-04	2016-06-09 17:26:49.527-04
256	doug	did you see how google's cdn fonts are stored? it seems like they have separated Arabic character range into a separate file. Is that so the NSA can detect when someone reads a page that has Arabic? LOL	2016-06-09 18:01:19.584-04	2016-06-09 18:01:19.584-04
257	doug	if so, I'll get someone to translate LOL to arabic characters and put it on every page load	2016-06-09 18:01:34.52-04	2016-06-09 18:01:34.52-04
258	doug	يضحك بصوت	2016-06-09 18:04:40.291-04	2016-06-09 18:04:40.291-04
259	doug	I suppose that should be right aligned? maybe backwards altogether?	2016-06-09 18:05:32.988-04	2016-06-09 18:05:32.988-04
260	doug	no it looks right actually, if the chromium address bar is going backwards properly	2016-06-09 18:12:56.097-04	2016-06-09 18:12:56.097-04
261	doug	I am allowing too much history too, need to finish link to look at archived chat	2016-06-09 18:13:33.686-04	2016-06-09 18:13:33.686-04
262	doug	I want my pages to handle every language. arabic is nearly the worst to handle - it is right-to-left	2016-06-09 18:15:18.525-04	2016-06-09 18:15:18.525-04
263	doug	大聲笑 (traditional chinese, lol)   जबरदस्त हंसी (hindi, laugh loudly)   笑 (japanese, lol)	2016-06-09 18:21:15.94-04	2016-06-09 18:21:15.94-04
264	doug	🍔 1F354 hamburger 🍕 1F355 slice of pizza 🍙 1F359 rice ball 🍞 1F35E bread 🍣 1F363 sushi 🍨 1F368 ice cream	2016-06-09 18:27:35.81-04	2016-06-09 18:27:35.81-04
265	doug	☕ 2615 hot beverage ⛾ 26FE restaurant 🍅 1F345 tomato 🍊 1F34A tangerine 🍏 1F34F green apple	2016-06-09 18:27:57.803-04	2016-06-09 18:27:57.803-04
266	doug	👍 👎	2016-06-09 18:28:39.832-04	2016-06-09 18:28:39.832-04
267	doug	𝄠	2016-06-09 18:28:59.442-04	2016-06-09 18:28:59.442-04
268	doug	wow, everything	2016-06-09 18:29:03.098-04	2016-06-09 18:29:03.098-04
269	user858424782	back :D	2016-06-09 18:29:17.457-04	2016-06-09 18:29:17.457-04
270	doug	you see all those extended unicode characters above?	2016-06-09 18:30:20.077-04	2016-06-09 18:30:20.077-04
271	user858424782	yep.	2016-06-09 18:34:08.524-04	2016-06-09 18:34:08.524-04
272	doug	it's awesome that it is storing/loading the extended characters properly already. I did it right to begin with :)	2016-06-09 18:34:44.876-04	2016-06-09 18:34:44.876-04
273	doug	there was a good chance of some issue with storing/loading the strings with sql connections	2016-06-09 18:35:06.844-04	2016-06-09 18:35:06.844-04
274	doug	sql connections often have charset issues	2016-06-09 18:35:15.156-04	2016-06-09 18:35:15.156-04
275	user858424782	which DBMS are you using?	2016-06-09 18:35:58.596-04	2016-06-09 18:35:58.596-04
276	doug	postgres	2016-06-09 18:36:15.771-04	2016-06-09 18:36:15.771-04
277	user858424782	nice :D	2016-06-09 18:36:26.178-04	2016-06-09 18:36:26.178-04
278	doug	the cpu usage and network usage is super low for this	2016-06-09 18:37:01.375-04	2016-06-09 18:37:01.375-04
279	doug	the time from send to notify is in milliseconds	2016-06-09 18:37:37.066-04	2016-06-09 18:37:37.066-04
280	doug	codementor needs this code lol. their chat thing is a disgrace	2016-06-09 18:38:10.146-04	2016-06-09 18:38:10.146-04
281	doug	notify thing	2016-06-09 18:38:15.537-04	2016-06-09 18:38:15.537-04
282	doug	idle long polling is 265 bytes every 2.5 minutes, or 1.7 bytes per second, average	2016-06-09 18:43:48.674-04	2016-06-09 18:43:48.674-04
283	doug	average of 14 bits per second to have chat window running	2016-06-09 18:44:14.471-04	2016-06-09 18:44:14.471-04
284	doug	I could probably cut that down, should be 3.5 minutes	2016-06-09 18:44:45.053-04	2016-06-09 18:44:45.053-04
285	doug	you see your own messages the same way you see other people's messages, so you see your message at the same time that other people see it	2016-06-09 18:45:25.52-04	2016-06-09 18:45:25.52-04
286	user858424782	I want to see my own messsages differently.	2016-06-09 18:46:18.91-04	2016-06-09 18:46:18.91-04
287	doug	what should I do? light background?	2016-06-09 18:46:36.461-04	2016-06-09 18:46:36.461-04
288	doug	you can change your name in the field at the top	2016-06-09 18:46:54.832-04	2016-06-09 18:46:54.832-04
289	doug	if you want :)	2016-06-09 18:47:17.615-04	2016-06-09 18:47:17.615-04
290	doug	what should I do to indicate own message?	2016-06-09 18:47:31.671-04	2016-06-09 18:47:31.671-04
291	doug	text color?	2016-06-09 18:47:45.465-04	2016-06-09 18:47:45.465-04
292	ilhami	:d	2016-06-09 18:48:08.702-04	2016-06-09 18:48:08.702-04
293	ilhami	yay	2016-06-09 18:48:10.7-04	2016-06-09 18:48:10.7-04
294	doug	I significantly increased the long poll time	2016-06-09 18:52:49.322-04	2016-06-09 18:52:49.322-04
295	doug	was 120 seconds, now 210 seconds	2016-06-09 18:53:00.356-04	2016-06-09 18:53:00.356-04
296	doug	you got past the server restart, right? no issue?	2016-06-09 18:53:13.769-04	2016-06-09 18:53:13.769-04
297	doug	yay, works for me with 3.5 minute long poll time, no errors	2016-06-09 19:00:26.615-04	2016-06-09 19:00:26.615-04
298	doug	idle long poll overhead is 1.26 bits per second average	2016-06-09 19:01:33.037-04	2016-06-09 19:01:33.037-04
299	ilhami	I wanat a list over active users	2016-06-09 19:02:01.048-04	2016-06-09 19:02:01.048-04
300	ilhami	want*	2016-06-09 19:02:04.644-04	2016-06-09 19:02:04.644-04
301	doug	chromium times out in 4 minutes. 3.5	2016-06-09 19:02:06.676-04	2016-06-09 19:02:06.676-04
302	doug	yeah, should be there where site links are	2016-06-09 19:02:15.036-04	2016-06-09 19:02:15.036-04
303	doug	that is list of what I consider the most useful programming sites on the internet for what I am working on right now	2016-06-09 19:02:34.162-04	2016-06-09 19:02:34.162-04
304	doug	yeah, and a profile image	2016-06-09 19:03:14.268-04	2016-06-09 19:03:14.268-04
305	doug	yeah, the long poll should give a name, then the server can see the names of all waiters. it will remove disconnected people within 3.5 minutes of them leaving	2016-06-09 19:04:27.598-04	2016-06-09 19:04:27.598-04
306	ilhami	are you working on these fixes and ideas I am giving you ?:D	2016-06-09 19:07:21.348-04	2016-06-09 19:07:21.348-04
307	doug	yeah :)	2016-06-09 19:10:40.625-04	2016-06-09 19:10:40.625-04
308	doug	each worker handles its own wait queues, so I'll have to add a thing in the master to "touch" a username, and touch it whenever a user starts a wait, and make them naturally time themselves out if they are not touched, and a thing to ask the master for the current list of users	2016-06-09 19:11:46.041-04	2016-06-09 19:11:46.041-04
309	ilhami	coolio. 	2016-06-09 19:12:30.934-04	2016-06-09 19:12:30.934-04
310	doug	my ride is going to get food soon... thanks for the help though. maybe you can help later?	2016-06-09 19:13:26.862-04	2016-06-09 19:13:26.862-04
311	doug	it is way better now	2016-06-09 19:13:32.312-04	2016-06-09 19:13:32.312-04
312	doug	I almost have user list done lol actually	2016-06-09 19:18:25.36-04	2016-06-09 19:18:25.36-04
313	ilhami	yeah I want to help if I am online later :D	2016-06-09 19:19:54.621-04	2016-06-09 19:19:54.621-04
314	doug	cool. I got a chunk of it working	2016-06-09 19:29:55.874-04	2016-06-09 19:29:55.874-04
315	doug	back shortly	2016-06-09 19:30:20.127-04	2016-06-09 19:30:20.127-04
316	ilhami	ok.	2016-06-09 19:40:32.757-04	2016-06-09 19:40:32.757-04
317	doug	back	2016-06-09 20:19:50.896-04	2016-06-09 20:19:50.896-04
318	doug	https://github.com/doug65536/doug16k-site	2016-06-09 21:12:21.552-04	2016-06-09 21:12:21.552-04
319	doug	^ source	2016-06-09 21:22:43.075-04	2016-06-09 21:22:43.075-04
320	doug	(╯°□°)╯︵ ┻━┻	2016-06-09 21:41:48.568-04	2016-06-09 21:41:48.568-04
321	doug	⛈	2016-06-09 22:20:44.183-04	2016-06-09 22:20:44.183-04
651	ilhami	:p	2016-06-13 20:51:27.842-04	2016-06-13 20:51:27.842-04
322	doug	wow, check this page out, https://en.wikibooks.org/wiki/Unicode/List_of_useful_symbols	2016-06-09 22:21:23.44-04	2016-06-09 22:21:23.44-04
323	doug	I added an indication for own-messages. how's that?	2016-06-09 22:55:56.439-04	2016-06-09 22:55:56.439-04
324	ilhami	:D	2016-06-10 13:30:18.711-04	2016-06-10 13:30:18.711-04
325	ilhami	nice indication	2016-06-10 13:30:26.985-04	2016-06-10 13:30:26.985-04
326	ilhami	but it could be improved with some different colors I think.	2016-06-10 13:30:42.168-04	2016-06-10 13:30:42.168-04
327	doug	I tried colors... I couldn't find anything I thought looked okay	2016-06-10 13:57:01.127-04	2016-06-10 13:57:01.127-04
328	ilhami	oh	2016-06-10 14:01:47.143-04	2016-06-10 14:01:47.143-04
329	ilhami	google.com	2016-06-10 14:01:57.684-04	2016-06-10 14:01:57.684-04
330	ilhami	I want to be able to click link.s	2016-06-10 14:02:05.455-04	2016-06-10 14:02:05.455-04
331	ilhami	links*	2016-06-10 14:02:06.905-04	2016-06-10 14:02:06.905-04
332	ilhami	http://google.dk	2016-06-10 14:02:17.682-04	2016-06-10 14:02:17.682-04
333	ilhami	you can still have timestamp in the right side.	2016-06-10 14:09:33.75-04	2016-06-10 14:09:33.75-04
334	doug	yeah I definitely need links, markdown, code samples	2016-06-10 14:44:27.039-04	2016-06-10 14:44:27.039-04
335	doug	this is running under a normal account now. until today it was running as root	2016-06-10 14:44:57.664-04	2016-06-10 14:44:57.664-04
336	doug	I'm half done the authentication stuff. 	2016-06-10 14:46:29.858-04	2016-06-10 14:46:29.858-04
337	ilhami	:D	2016-06-10 14:46:32.8-04	2016-06-10 14:46:32.8-04
338	ilhami	looking forward to it	2016-06-10 14:46:38.734-04	2016-06-10 14:46:38.734-04
339	doug	it's on github	2016-06-10 14:49:09.395-04	2016-06-10 14:49:09.395-04
340	doug	https://github.com/doug65536/doug16k-site	2016-06-10 14:49:28.892-04	2016-06-10 14:49:28.892-04
341	doug	lol, would be nice if that ^ was a link right?	2016-06-10 14:49:38.077-04	2016-06-10 14:49:38.077-04
342	doug	I need to document it a bit so it makes sense why I am doing all that message passing and stuff. it is because there are multiple webserver worker processes and any one of them can get the request at any time, so they need to cooperate to stay in sync	2016-06-10 14:50:58.701-04	2016-06-10 14:50:58.701-04
343	doug	this scales up to a large number of processors, if available. it should handle thousands of users	2016-06-10 14:51:26.336-04	2016-06-10 14:51:26.336-04
344	ilhami	cool! when can you help me with some PHP?	2016-06-10 14:57:12.94-04	2016-06-10 14:57:12.94-04
345	doug	I have some time	2016-06-10 15:01:09.51-04	2016-06-10 15:01:09.51-04
346	ilhami	Fatal error: Constant expression contains invalid operations in /var/www/myfood/Config/DatabaseConfig.php on line 11	2016-06-10 15:04:23.841-04	2016-06-10 15:04:23.841-04
347	ilhami	I get this error.	2016-06-10 15:04:30.282-04	2016-06-10 15:04:30.282-04
348	doug	looks like a syntax error	2016-06-10 15:13:43.513-04	2016-06-10 15:13:43.513-04
349	doug	link?	2016-06-10 15:13:47.382-04	2016-06-10 15:13:47.382-04
350	doug	crap has passwords in it right?	2016-06-10 15:14:14.331-04	2016-06-10 15:14:14.331-04
351	doug	sounds like a mistake in quoting	2016-06-10 15:14:52.259-04	2016-06-10 15:14:52.259-04
352	doug	matching ````text```` is easy:  /(`+)(.*?)\\1/	2016-06-10 15:26:28.226-04	2016-06-10 15:26:28.226-04
353	doug	:(	2016-06-10 18:57:22.498-04	2016-06-10 18:57:22.498-04
354	doug	ping	2016-06-11 14:45:01.136-04	2016-06-11 14:45:01.136-04
355	ilhami	.	2016-06-11 19:18:26.641-04	2016-06-11 19:18:26.641-04
356	ilhami	http://google.com	2016-06-11 19:18:42.106-04	2016-06-11 19:18:42.106-04
357	ilhami	-.-	2016-06-11 19:18:50.677-04	2016-06-11 19:18:50.677-04
358	doug	hey	2016-06-11 19:24:08.005-04	2016-06-11 19:24:08.005-04
359	doug	I almost have cursor up to edit working	2016-06-11 19:24:14.193-04	2016-06-11 19:24:14.193-04
360	doug	D:	2016-06-11 19:25:16.658-04	2016-06-11 19:25:16.658-04
361	doug	working on links	2016-06-11 19:36:33.422-04	2016-06-11 19:36:33.422-04
362	doug	http prefix: http://google.com, markdown: [google](http://google.com) www prefix: www.google.com `single backtick code` ``double backtick ` code`` ```triple backtick ` code```   <-- should work soon	2016-06-11 19:48:51.015-04	2016-06-11 19:48:51.015-04
363	doug	refresh. better?	2016-06-11 21:27:39.156-04	2016-06-11 21:27:39.156-04
364	doug	the above line: ```` http prefix: http://google.com, markdown: [google](http://google.com) www prefix: www.google.com `single backtick code` ``double backtick ` code`` ```triple backtick ` code``` ````	2016-06-11 21:28:58.441-04	2016-06-11 21:28:58.441-04
365	doug	whoa	2016-06-11 21:38:34.775-04	2016-06-11 21:38:34.775-04
366	doug	https://www.google.com/?q=test	2016-06-11 21:41:21.531-04	2016-06-11 21:41:21.531-04
367	doug	https://www.google.com/?q=test and stuff	2016-06-11 21:41:30.206-04	2016-06-11 21:41:30.206-04
368	doug	[nice markdown link](https://www.google.com/?q=test) test and `code` and www.google.com	2016-06-11 21:42:04.039-04	2016-06-11 21:42:04.039-04
369	doug	90% done cursor-up-edit	2016-06-11 21:42:27.092-04	2016-06-11 21:42:27.092-04
370	doug	1 sec	2016-06-11 21:42:28.766-04	2016-06-11 21:42:28.766-04
371	doug	refresh!	2016-06-11 21:43:30.189-04	2016-06-11 21:43:30.189-04
372	doug	javascript:alert('lol') is not allowed	2016-06-11 21:48:32.205-04	2016-06-11 21:48:32.205-04
373	doug	[malicious markdown](javascript:alert%28'lol'%29) won't work	2016-06-11 21:51:49.808-04	2016-06-11 21:51:49.808-04
374	doug	https://github.com/ https://gist.github.com/ https://bitbucket.com/ http://jstraight.com/ http://jsfiddle.net/ http://coliru.stacked-crooked.com/ https://regex101.com/ https://google.com/ http://cppreference.com/ https://developer.mozilla.org/en-US/docs/Web/javascript https://developer.mozilla.org/en-US/docs/Web/CSS https://developer.mozilla.org/en-US/docs/Web/SVG https://developer.mozilla.org/en-US/docs/Web/HTML http://caniuse.com/ https://www.postgresql.org/docs/9.5/static/index.html 	2016-06-11 22:11:39.674-04	2016-06-11 22:11:39.674-04
375	doug	plz test	2016-06-11 22:12:00.099-04	2016-06-11 22:12:00.099-04
376	ilhami	google.com	2016-06-11 22:16:54.999-04	2016-06-11 22:16:54.999-04
377	ilhami	http://google.com	2016-06-11 22:17:01.19-04	2016-06-11 22:17:01.19-04
378	doug	ah, a word ending in com?	2016-06-11 22:17:13.797-04	2016-06-11 22:17:13.797-04
379	doug	1 sec	2016-06-11 22:17:17.04-04	2016-06-11 22:17:17.04-04
380	doug	good indication?	2016-06-11 22:17:34.684-04	2016-06-11 22:17:34.684-04
381	ilhami	indication is a bit better. 	2016-06-11 22:18:05.737-04	2016-06-11 22:18:05.737-04
382	ilhami	where is timestamp ? :d	2016-06-11 22:18:08.702-04	2016-06-11 22:18:08.702-04
383	doug	the way I did the rendering is fucking brilliant	2016-06-11 22:18:11.405-04	2016-06-11 22:18:11.405-04
384	doug	oh that... yeah that is easy to do too	2016-06-11 22:18:21.321-04	2016-06-11 22:18:21.321-04
385	doug	oops sorry for swearing	2016-06-11 22:18:33.192-04	2016-06-11 22:18:33.192-04
386	doug	D:	2016-06-11 22:18:39.188-04	2016-06-11 22:18:39.188-04
387	ilhami	timestamp could be left to the nicks	2016-06-11 22:19:50.393-04	2016-06-11 22:19:50.393-04
388	ilhami	nick*	2016-06-11 22:19:56.132-04	2016-06-11 22:19:56.132-04
389	ilhami	oh I can also edit now	2016-06-11 22:20:01.258-04	2016-06-11 22:20:01.258-04
390	ilhami	timestamp could be left to the nick	2016-06-11 22:20:06.548-04	2016-06-11 22:20:06.548-04
391	ilhami	oh	2016-06-11 22:20:12.8-04	2016-06-11 22:20:12.8-04
392	ilhami	it doesn't edit. It rewrites the message.	2016-06-11 22:20:21.033-04	2016-06-11 22:20:21.033-04
393	doug	yeah it will edit soon	2016-06-11 22:20:43.362-04	2016-06-11 22:20:43.362-04
394	doug	doing frontend part first	2016-06-11 22:20:51.665-04	2016-06-11 22:20:51.665-04
395	doug	will send special request and handle special response	2016-06-11 22:20:59.684-04	2016-06-11 22:20:59.684-04
396	doug	refresh	2016-06-11 22:22:25.378-04	2016-06-11 22:22:25.378-04
397	doug	your link is a link now	2016-06-11 22:22:29.826-04	2016-06-11 22:22:29.826-04
398	doug	subdomain.long.url.anything.com	2016-06-11 22:22:45.617-04	2016-06-11 22:22:45.617-04
399	doug	you think I should handle .net and .org and every top level domain?	2016-06-11 22:23:38.013-04	2016-06-11 22:23:38.013-04
400	doug	k 1 sec for timestamp	2016-06-11 22:23:48.26-04	2016-06-11 22:23:48.26-04
401	ilhami	interpals.net	2016-06-11 22:23:52.477-04	2016-06-11 22:23:52.477-04
402	ilhami	:)	2016-06-11 22:23:55.512-04	2016-06-11 22:23:55.512-04
403	doug	refresh	2016-06-11 22:28:53.055-04	2016-06-11 22:28:53.055-04
404	doug	`/(\\[(.*?)\\]\\((http.*)\\))|(?:(http\\S+)\\b)|(?:(www\\..*)\\b)|(?:(\\S+\\.(?:(?:com)|(?:net)|(?:org)|(?:io)))\\b)/`	2016-06-11 22:29:39.97-04	2016-06-11 22:29:39.97-04
405	doug	.net	2016-06-11 22:30:54.619-04	2016-06-11 22:30:54.619-04
406	doug	^ good	2016-06-11 22:31:10.548-04	2016-06-11 22:31:10.548-04
407	ilhami	:D	2016-06-11 22:32:29.226-04	2016-06-11 22:32:29.226-04
408	ilhami	agar.io	2016-06-11 22:32:39.249-04	2016-06-11 22:32:39.249-04
409	ilhami	cool.	2016-06-11 22:32:42.546-04	2016-06-11 22:32:42.546-04
410	ilhami	I think the space between the text and underline is too much.	2016-06-11 22:33:01.371-04	2016-06-11 22:33:01.371-04
411	ilhami	can you reduce that a bit?	2016-06-11 22:33:05.059-04	2016-06-11 22:33:05.059-04
412	doug	oh that only happens in firefox lol	2016-06-11 22:33:15.921-04	2016-06-11 22:33:15.921-04
413	doug	background color selector does not work in firefox either	2016-06-11 22:33:48.535-04	2016-06-11 22:33:48.535-04
414	doug	firefox is broken	2016-06-11 22:33:51.066-04	2016-06-11 22:33:51.066-04
415	doug	I'm starting to not care if firefox doesn't work	2016-06-11 22:33:58.425-04	2016-06-11 22:33:58.425-04
416	doug	I don't want any different space - that is just an `<a>` tag happening	2016-06-11 22:34:50.159-04	2016-06-11 22:34:50.159-04
417	doug	I'll fix it, I can target a different element to make that happen	2016-06-11 22:35:12.12-04	2016-06-11 22:35:12.12-04
418	doug-firefox	hello from firefox	2016-06-11 22:39:44.266-04	2016-06-11 22:39:44.266-04
419	ilhami	hello	2016-06-11 22:40:03.427-04	2016-06-11 22:40:03.427-04
420	ilhami	:)	2016-06-11 22:40:05.136-04	2016-06-11 22:40:05.136-04
421	doug-firefox	do you see why? the css is nice and simple. inspect the link	2016-06-11 22:40:24.463-04	2016-06-11 22:40:24.463-04
422	doug-firefox	chrome does what I expect	2016-06-11 22:41:41.235-04	2016-06-11 22:41:41.235-04
423	doug-firefox	why do you use firefox?	2016-06-11 22:42:03.108-04	2016-06-11 22:42:03.108-04
424	ilhami	let me check chrome. 2 sec	2016-06-11 22:42:04.616-04	2016-06-11 22:42:04.616-04
425	doug-firefox	firefox is messed up lately	2016-06-11 22:42:08.318-04	2016-06-11 22:42:08.318-04
426	ilhami	yeah it looks right in chrome	2016-06-11 22:42:31.679-04	2016-06-11 22:42:31.679-04
427	doug-firefox	I'm in firefox right now, it works	2016-06-11 22:42:40.983-04	2016-06-11 22:42:40.983-04
428	ilhami	I use FF because it's the default browser in most Unix dists :D	2016-06-11 22:42:43.938-04	2016-06-11 22:42:43.938-04
429	ilhami	it works.. agar.io	2016-06-11 22:43:01.995-04	2016-06-11 22:43:01.995-04
430	doug-firefox	yeah, chromium is pretty open too	2016-06-11 22:43:02.215-04	2016-06-11 22:43:02.215-04
431	doug-firefox	gpl purists prefer the firefox license I guess	2016-06-11 22:43:18.543-04	2016-06-11 22:43:18.543-04
432	ilhami	but the problem is that in FF the underline is too much below the link itself	2016-06-11 22:43:22.787-04	2016-06-11 22:43:22.787-04
433	doug-firefox	yeah I see that, in my firefox	2016-06-11 22:43:40.78-04	2016-06-11 22:43:40.78-04
434	doug-firefox	inspect it though, do you see why it would?	2016-06-11 22:43:52.25-04	2016-06-11 22:43:52.25-04
435	doug-firefox	all it has is some margin 0	2016-06-11 22:43:57.287-04	2016-06-11 22:43:57.287-04
436	doug-firefox	turn stuff off, can you fix the underline?	2016-06-11 22:44:07.983-04	2016-06-11 22:44:07.983-04
437	ilhami	let me try.	2016-06-11 22:44:17.275-04	2016-06-11 22:44:17.275-04
438	ilhami	http://stackoverflow.com/questions/3085394/space-between-text-and-underline	2016-06-11 22:47:29.052-04	2016-06-11 22:47:29.052-04
439	ilhami	I guess you could use this trick?	2016-06-11 22:47:33.453-04	2016-06-11 22:47:33.453-04
440	doug-firefox	it's not doing anything that messes up underline, that I can see	2016-06-11 22:50:22.863-04	2016-06-11 22:50:22.863-04
441	doug-firefox	checking...	2016-06-11 22:50:37.76-04	2016-06-11 22:50:37.76-04
442	doug-firefox	so, something to do with padding?	2016-06-11 22:51:05.814-04	2016-06-11 22:51:05.814-04
443	doug	I'll review all the padding	2016-06-11 22:51:21.823-04	2016-06-11 22:51:21.823-04
444	doug	maybe just force-off the underline?	2016-06-11 22:54:21.536-04	2016-06-11 22:54:21.536-04
445	doug	firefox is crap, I don't really care what happens in FF anymore	2016-06-11 22:54:55.531-04	2016-06-11 22:54:55.531-04
446	doug	I'm not putting a mess in my css for it	2016-06-11 22:55:02.149-04	2016-06-11 22:55:02.149-04
447	doug	it's a flex bug	2016-06-11 22:55:35.59-04	2016-06-11 22:55:35.59-04
448	doug	FF will fix it eventually	2016-06-11 22:55:41.293-04	2016-06-11 22:55:41.293-04
449	doug	there's [a site dedicated to the css + flex mess](https://github.com/philipwalton/flexbugs) 	2016-06-11 22:57:03.591-04	2016-06-11 22:57:03.591-04
450	doug	oops	2016-06-11 23:06:04.524-04	2016-06-11 23:06:04.524-04
451	doug-firefox	how's that?	2016-06-11 23:15:12.416-04	2016-06-11 23:15:12.416-04
452	doug-firefox	let me debug edit a bit more, first cursor up does wrong thing	2016-06-11 23:16:06.647-04	2016-06-11 23:16:06.647-04
453	doug-firefox	check out `function renderMessage(input)`, it does the parsing and markdown/code/links	2016-06-11 23:16:59.316-04	2016-06-11 23:16:59.316-04
454	doug-firefox	I need to add *italic* and **bold** and a couple of other things	2016-06-11 23:17:23.921-04	2016-06-11 23:17:23.921-04
455	doug-firefox	timestamp partially working	2016-06-11 23:31:56.781-04	2016-06-11 23:31:56.781-04
456	doug-firefox	a	2016-06-11 23:32:51.846-04	2016-06-11 23:32:51.846-04
457	doug-firefox	b	2016-06-11 23:34:33.548-04	2016-06-11 23:34:33.548-04
458	doug-firefox	hmm, invalid date only after first	2016-06-11 23:34:42.591-04	2016-06-11 23:34:42.591-04
459	doug-firefox	I dont see how that makes any difference	2016-06-11 23:34:48.834-04	2016-06-11 23:34:48.834-04
460	doug-firefox	a	2016-06-11 23:36:31.241-04	2016-06-11 23:36:31.241-04
461	doug-firefox	a	2016-06-11 23:41:14.249-04	2016-06-11 23:41:14.249-04
462	doug-firefox	ok fixed timestamp bug	2016-06-11 23:41:25.606-04	2016-06-11 23:41:25.606-04
463	doug-firefox	now making it look less awful	2016-06-11 23:41:31.013-04	2016-06-11 23:41:31.013-04
464	doug	better?	2016-06-11 23:56:18.073-04	2016-06-11 23:56:18.073-04
465	doug	timestamp working	2016-06-11 23:57:40.888-04	2016-06-11 23:57:40.888-04
466	doug	does it show your local time?	2016-06-11 23:58:14.989-04	2016-06-11 23:58:14.989-04
467	doug	how's that?	2016-06-12 00:19:15.391-04	2016-06-12 00:19:15.391-04
468	doug	oh! I am making the message renderer way better!!!	2016-06-12 00:54:10.335-04	2016-06-12 00:54:10.335-04
469	doug	and easy to extend	2016-06-12 00:54:22.506-04	2016-06-12 00:54:22.506-04
470	doug	done	2016-06-12 01:27:40.294-04	2016-06-12 01:27:40.294-04
471	doug	look at `renderMessage` code in debugger in wschat.js	2016-06-12 01:28:14.238-04	2016-06-12 01:28:14.238-04
472	doug	*italic* and **bold** working	2016-06-12 02:21:49.543-04	2016-06-12 02:21:49.543-04
473	doug	bold code? **`for(;;);`**	2016-06-12 02:25:51.323-04	2016-06-12 02:25:51.323-04
474	doug	no they aren't self recursive like that	2016-06-12 02:27:15.99-04	2016-06-12 02:27:15.99-04
475	doug	replacements replace with a node, it doesn't piece together html	2016-06-12 02:29:22.643-04	2016-06-12 02:29:22.643-04
476	doug	the code should be totally secure	2016-06-12 02:29:30.443-04	2016-06-12 02:29:30.443-04
477	doug	I reduced the scrollback	2016-06-12 03:08:21.117-04	2016-06-12 03:08:21.117-04
478	doug	I need to add "load earlier messages" / "load newer messages" / "join users in this room now" links	2016-06-12 03:09:01.576-04	2016-06-12 03:09:01.576-04
479	doug	need permalink to each message	2016-06-12 03:09:39.803-04	2016-06-12 03:09:39.803-04
480	doug	goes in pull down menu mentioned before	2016-06-12 03:09:57.152-04	2016-06-12 03:09:57.152-04
481	doug	I have most of the backend stuff for active users list	2016-06-12 03:10:50.688-04	2016-06-12 03:10:50.688-04
563	doug	refresh, fixed	2016-06-13 17:30:52.284-04	2016-06-13 17:30:52.284-04
652	ilhami	:P	2016-06-13 20:51:29.794-04	2016-06-13 20:51:29.794-04
482	doug	I paused because it is really a session list, so I might as well do authentication / anonymous session thing and use that session for active users	2016-06-12 03:11:34.552-04	2016-06-12 03:11:34.552-04
483	doug	https://opensource.keycdn.com/fontawesome/4.6.3/font-awesome.min.css 	2016-06-12 03:42:36.219-04	2016-06-12 03:42:36.219-04
484	doug-firefox	test	2016-06-12 04:44:57.942-04	2016-06-12 04:44:57.942-04
485	ilhami	:D	2016-06-12 08:07:21.177-04	2016-06-12 08:07:21.177-04
486	ilhami	yeah it shows local time	2016-06-12 08:07:26.137-04	2016-06-12 08:07:26.137-04
487	ilhami	**ss**	2016-06-12 08:12:35.743-04	2016-06-12 08:12:35.743-04
488	ilhami	cool.	2016-06-12 08:12:38.571-04	2016-06-12 08:12:38.571-04
489	doug	hi	2016-06-12 13:35:16.782-04	2016-06-12 13:35:16.782-04
490	doug	now oldest message goes away at the limit	2016-06-12 13:46:42.038-04	2016-06-12 13:46:42.038-04
491	doug	should D:	2016-06-12 13:46:52.019-04	2016-06-12 13:46:52.019-04
492	doug	test	2016-06-12 13:49:28.66-04	2016-06-12 13:49:28.66-04
493	doug	test2	2016-06-12 13:50:14.985-04	2016-06-12 13:50:14.985-04
494	doug	now that it caps the history distance, I need to add the links to load older/newer messages	2016-06-12 13:55:12.193-04	2016-06-12 13:55:12.193-04
495	doug	:(	2016-06-12 15:01:27.233-04	2016-06-12 15:01:27.233-04
496	doug	I should change it to use flex for the whole layout	2016-06-12 15:53:23.196-04	2016-06-12 15:53:23.196-04
497	doug	This is basically the layout I am going for http://jstraight.com/1362/4	2016-06-13 03:15:01.5-04	2016-06-13 03:15:01.5-04
498	doug	with no debug borders and with margins/padding etc... the responsiveness and structure is what I mean	2016-06-13 03:15:47.473-04	2016-06-13 03:15:47.473-04
499	doug	I dont suggest using classes like that either. a class should say what it is, not what it looks like	2016-06-13 03:19:03.78-04	2016-06-13 03:19:03.78-04
500	doug	I did it like that for easy debug. maybe not a bad way to do flexbox though. more debuggable than some mess of "proper" css	2016-06-13 03:19:28.107-04	2016-06-13 03:19:28.107-04
501	doug	[improved](http://jstraight.com/1362/5)	2016-06-13 03:24:58.505-04	2016-06-13 03:24:58.505-04
502	doug	[improved again](http://jstraight.com/1362/7)	2016-06-13 04:40:34.283-04	2016-06-13 04:40:34.283-04
503	doug	change the div at the top of the css to xdiv to see it without debug crap	2016-06-13 04:40:47.917-04	2016-06-13 04:40:47.917-04
504	doug	[latest flexbox prototype](http://jstraight.com/1362/12)	2016-06-13 05:46:45.725-04	2016-06-13 05:46:45.725-04
505	ilhami	What are the changes? :D	2016-06-13 13:55:24.283-04	2016-06-13 13:55:24.283-04
506	doug	the flex layout it is totally responsive	2016-06-13 13:59:30.589-04	2016-06-13 13:59:30.589-04
507	doug	ah, good shared host for us/canada is totalchoice	2016-06-13 14:00:29.11-04	2016-06-13 14:00:29.11-04
508	doug	a bit pricy but amazing service	2016-06-13 14:00:39.738-04	2016-06-13 14:00:39.738-04
509	doug	you go on their irc, you instantly talk to someone, who fixes it right then, lol	2016-06-13 14:01:17.912-04	2016-06-13 14:01:17.912-04
510	doug	I've had like 2 outages in years and both times they were all over it and had it fixed in < 2 minutes	2016-06-13 14:01:57.773-04	2016-06-13 14:01:57.773-04
511	doug	http://www.totalchoicehosting.com/	2016-06-13 14:03:31.184-04	2016-06-13 14:03:31.184-04
512	doug	you can get a reseller account and sublet your shared hosting	2016-06-13 14:04:05.583-04	2016-06-13 14:04:05.583-04
513	ilhami	but would that be reasonable for Europe?	2016-06-13 14:05:48.168-04	2016-06-13 14:05:48.168-04
514	ilhami	do they have servers in Europe too?	2016-06-13 14:05:53.037-04	2016-06-13 14:05:53.037-04
515	ilhami	the responsiveness is not so good when the browser is resized to a smaller size	2016-06-13 14:06:31.023-04	2016-06-13 14:06:31.023-04
516	7617a xroidsux3	Here	2016-06-13 14:09:02.843-04	2016-06-13 14:09:02.843-04
517	7617a xroidsux3	?	2016-06-13 14:09:16.122-04	2016-06-13 14:09:16.122-04
518	7617a xroidsux3	Or in jstraight?	2016-06-13 14:10:01.262-04	2016-06-13 14:10:01.262-04
519	ilhami	here	2016-06-13 14:12:20.331-04	2016-06-13 14:12:20.331-04
520	7617a xroidsux3	I am prototyping a fully flex layout for chat on jstraight	2016-06-13 14:15:14.582-04	2016-06-13 14:15:14.582-04
521	7617a xroidsux3	Not sure I am afk on phone	2016-06-13 14:16:07.853-04	2016-06-13 14:16:07.853-04
522	ilhami	push the changes dude	2016-06-13 14:17:09.826-04	2016-06-13 14:17:09.826-04
523	ilhami	:p	2016-06-13 14:18:43.392-04	2016-06-13 14:18:43.392-04
524	ilhami	and make smilies work too	2016-06-13 14:18:49.601-04	2016-06-13 14:18:49.601-04
525	doug	:D	2016-06-13 14:20:51.595-04	2016-06-13 14:20:51.595-04
526	doug	brb in 30 minutes or so, grabbing a coffee/taking quick walk	2016-06-13 14:21:24.325-04	2016-06-13 14:21:24.325-04
527	doug	ba k	2016-06-13 14:47:11.298-04	2016-06-13 14:47:11.298-04
528	doug		2016-06-13 14:47:11.454-04	2016-06-13 14:47:11.454-04
529	doug	which smilies though	2016-06-13 14:50:36.695-04	2016-06-13 14:50:36.695-04
530	doug	free?	2016-06-13 14:51:17.249-04	2016-06-13 14:51:17.249-04
531	doug	should be a single texture atlas with css cropping out each one from the same image	2016-06-13 14:53:37.925-04	2016-06-13 14:53:37.925-04
532	ilhami	smilies like :)	2016-06-13 14:58:26.537-04	2016-06-13 14:58:26.537-04
533	ilhami	and :D	2016-06-13 14:58:28.541-04	2016-06-13 14:58:28.541-04
534	doug	😃	2016-06-13 15:10:00.034-04	2016-06-13 15:10:00.034-04
535	ilhami	:D	2016-06-13 15:56:51.738-04	2016-06-13 15:56:51.738-04
536	ilhami	Those smilies are black and white lol	2016-06-13 15:57:01.339-04	2016-06-13 15:57:01.339-04
537	ilhami	make some colored ones..	2016-06-13 15:57:07.778-04	2016-06-13 15:57:07.778-04
538	ilhami	I guess you can integrate some from some service?	2016-06-13 15:57:33.544-04	2016-06-13 15:57:33.544-04
539	doug	you want images?	2016-06-13 16:38:47.486-04	2016-06-13 16:38:47.486-04
540	doug	😞 ☠️ 👨 👩 👴 👶 [lol, seriously?](http://unicode.org/emoji/charts/emoji-zwj-sequences.html)	2016-06-13 17:03:19.554-04	2016-06-13 17:03:19.554-04
541	doug	a text renderer is seriously expected to merge 👨‍👩‍👦 into a single family glyph like 👪 ?	2016-06-13 17:04:51.533-04	2016-06-13 17:04:51.533-04
542	ilhami	:)	2016-06-13 17:07:52.93-04	2016-06-13 17:07:52.93-04
543	ilhami	:/	2016-06-13 17:07:58.569-04	2016-06-13 17:07:58.569-04
544	ilhami	:S	2016-06-13 17:08:00.043-04	2016-06-13 17:08:00.043-04
545	ilhami	make them work Doug	2016-06-13 17:08:04.121-04	2016-06-13 17:08:04.121-04
546	ilhami	:D	2016-06-13 17:08:05.512-04	2016-06-13 17:08:05.512-04
547	doug	on it lol	2016-06-13 17:12:26.381-04	2016-06-13 17:12:26.381-04
548	doug	any needed beyond these? :) :D :| :( D: :O :o B) (y) (n)  	2016-06-13 17:15:05.914-04	2016-06-13 17:15:05.914-04
549	doug	wow, I can't seem to find any emoji texture atlases around!	2016-06-13 17:21:00.909-04	2016-06-13 17:21:00.909-04
550	doug	people are using tons of separate images? wow	2016-06-13 17:21:17.487-04	2016-06-13 17:21:17.487-04
551	doug	Adobe Stock free images - From 99¢ an image - adobe.com‎   LOL	2016-06-13 17:22:05.61-04	2016-06-13 17:22:05.61-04
552	doug	free 99 cent images	2016-06-13 17:22:10.488-04	2016-06-13 17:22:10.488-04
553	doug	nice one google	2016-06-13 17:22:18.311-04	2016-06-13 17:22:18.311-04
554	doug	they let adobe spam the index for "free image" and blatantly bait and switch you to 99 cent images	2016-06-13 17:23:51.856-04	2016-06-13 17:23:51.856-04
555	doug	https://en.wikipedia.org/wiki/Bait-and-switch	2016-06-13 17:24:35.663-04	2016-06-13 17:24:35.663-04
556	doug	^^ a crime	2016-06-13 17:24:45.758-04	2016-06-13 17:24:45.758-04
557	doug	nice! svg ones http://emojione.com/	2016-06-13 17:26:55.919-04	2016-06-13 17:26:55.919-04
558	doug	how am I going to deal with 1834 emojies	2016-06-13 17:28:01.533-04	2016-06-13 17:28:01.533-04
559	doug	is there an official standard for :) :D :| etc?	2016-06-13 17:28:27.786-04	2016-06-13 17:28:27.786-04
560	doug	nice http://www.jsdelivr.com/projects/emojione	2016-06-13 17:29:23.31-04	2016-06-13 17:29:23.31-04
561	doug	wow www.jsdelivr.com seems good	2016-06-13 17:30:10.146-04	2016-06-13 17:30:10.146-04
562	doug	lol, bug!	2016-06-13 17:30:17.479-04	2016-06-13 17:30:17.479-04
564	doug	I named all of the anonymous functions, so if you activate timeline, and hit refresh, and zoom into `updateResponseHandler` you can see how fast it is. it's fast	2016-06-13 17:50:44.544-04	2016-06-13 17:50:44.544-04
565	doug	0.55ms (550μs) per message, average	2016-06-13 18:02:49.451-04	2016-06-13 18:02:49.451-04
566	doug	that's for everything, parsing, adding to document, and all	2016-06-13 18:04:15.981-04	2016-06-13 18:04:15.981-04
567	doug	I want people that say `.forEach` and friends are "slow" to explain that	2016-06-13 18:04:57.804-04	2016-06-13 18:04:57.804-04
568	doug	jsperf.com and its "performance tests" filled a lot of people's heads with crap	2016-06-13 18:05:45.824-04	2016-06-13 18:05:45.824-04
569	doug	my code is fast because it appends them all to a document fragment then slams the whole thing into the page in one step	2016-06-13 18:12:29.094-04	2016-06-13 18:12:29.094-04
570	doug	in batches up to 64	2016-06-13 18:12:52.295-04	2016-06-13 18:12:52.295-04
571	doug	the response size is adjusted to realign your next request at a multiple of 64, maximizing the chances of a cache hit	2016-06-13 18:13:28.662-04	2016-06-13 18:13:28.662-04
572	doug	so, if you requested since 124, then it will give you 4 records, making your next request be aligned on a multiple of 64 (128). if it gave you all 64, then your next request would begin at some weird `since` value (188), which probably isn't cached. `since=128` probably is cached	2016-06-13 18:18:11.216-04	2016-06-13 18:18:11.216-04
573	doug	makes it 64x more likely to hit the cache	2016-06-13 18:18:22.563-04	2016-06-13 18:18:22.563-04
574	doug	that only happens on the `stream` endpoint, though	2016-06-13 18:19:17.743-04	2016-06-13 18:19:17.743-04
575	doug	hey the name is bottom aligned D:    fixing	2016-06-13 18:26:00.287-04	2016-06-13 18:26:00.287-04
576	doug	https://doug16k.com/vendor/emojione.com/1f600.svg	2016-06-13 19:09:00.069-04	2016-06-13 19:09:00.069-04
577	ilhami	:D	2016-06-13 19:09:19.888-04	2016-06-13 19:09:19.888-04
578	doug	almost... I put them up there... now I have to convert them to unicode smiles, then convert *those* into emoji svgs	2016-06-13 19:09:54.669-04	2016-06-13 19:09:54.669-04
579	ilhami	what are those two L's in the left side of the screen?	2016-06-13 19:10:18.134-04	2016-06-13 19:10:18.134-04
580	ilhami	below the username 	2016-06-13 19:10:25.154-04	2016-06-13 19:10:25.154-04
581	doug	oh those are links... they are crap. they are why I want to abandon this layout and go all-flex	2016-06-13 19:10:36.898-04	2016-06-13 19:10:36.898-04
582	doug	it's a huge pain to use ancient layout crap for that	2016-06-13 19:10:49.568-04	2016-06-13 19:10:49.568-04
583	doug	with flex you can just whack new things into the page and it resizes right	2016-06-13 19:11:03.343-04	2016-06-13 19:11:03.343-04
584	doug	those are links to "load older messages" and "load newer messages"	2016-06-13 19:11:34.687-04	2016-06-13 19:11:34.687-04
585	ilhami	I don't see them as links	2016-06-13 19:11:47.988-04	2016-06-13 19:11:47.988-04
586	doug	half done code - I stopped there because it is a pain in the butt to work on this layout	2016-06-13 19:11:55.751-04	2016-06-13 19:11:55.751-04
587	ilhami	move to the flex thing then	2016-06-13 19:12:04.945-04	2016-06-13 19:12:04.945-04
588	doug	you saw 100% flex layout I did right?	2016-06-13 19:12:06.186-04	2016-06-13 19:12:06.186-04
589	ilhami	yeah I skimmed it	2016-06-13 19:12:20.047-04	2016-06-13 19:12:20.047-04
590	ilhami	b	2016-06-13 19:12:20.757-04	2016-06-13 19:12:20.757-04
591	ilhami	rb	2016-06-13 19:12:23.35-04	2016-06-13 19:12:23.35-04
592	doug	http://jstraight.com/1362/10	2016-06-13 19:12:42.762-04	2016-06-13 19:12:42.762-04
593	doug	I should add target="_blank" on hrefs... 1 sec	2016-06-13 19:13:04.573-04	2016-06-13 19:13:04.573-04
594	doug	done	2016-06-13 19:14:16.418-04	2016-06-13 19:14:16.418-04
595	doug	refresh, now links will automagically open in new window	2016-06-13 19:14:24.745-04	2016-06-13 19:14:24.745-04
596	ilhami	ye	2016-06-13 19:18:00.601-04	2016-06-13 19:18:00.601-04
597	ilhami	:D	2016-06-13 19:23:53.994-04	2016-06-13 19:23:53.994-04
598	doug	emoji index endpoint working https://doug16k.com/api/wschat/emoji-index	2016-06-13 19:30:54.001-04	2016-06-13 19:30:54.001-04
599	ilhami	:D	2016-06-13 19:38:49.274-04	2016-06-13 19:38:49.274-04
600	ilhami	:D	2016-06-13 19:38:53.048-04	2016-06-13 19:38:53.048-04
601	ilhami	output is not working though haha	2016-06-13 19:38:57.183-04	2016-06-13 19:38:57.183-04
602	ilhami	:S	2016-06-13 19:41:23.243-04	2016-06-13 19:41:23.243-04
603	doug	almost	2016-06-13 19:59:26.87-04	2016-06-13 19:59:26.87-04
604	ilhami	:D	2016-06-13 20:01:03.125-04	2016-06-13 20:01:03.125-04
605	ilhami	:P	2016-06-13 20:01:05.01-04	2016-06-13 20:01:05.01-04
606	ilhami	60%...	2016-06-13 20:01:15.22-04	2016-06-13 20:01:15.22-04
607	ilhami	:D	2016-06-13 20:01:16.464-04	2016-06-13 20:01:16.464-04
608	doug	🏋️🏿	2016-06-13 20:02:57.815-04	2016-06-13 20:02:57.815-04
609	doug	this font appears to have every emoji, wow	2016-06-13 20:03:09.381-04	2016-06-13 20:03:09.381-04
610	ilhami	:D	2016-06-13 20:04:37.163-04	2016-06-13 20:04:37.163-04
611	ilhami	Nooooo	2016-06-13 20:04:40.906-04	2016-06-13 20:04:40.906-04
612	ilhami	:/	2016-06-13 20:04:43.14-04	2016-06-13 20:04:43.14-04
613	ilhami	I want coloured emojis	2016-06-13 20:04:54.638-04	2016-06-13 20:04:54.638-04
614	ilhami	not black white boring ones	2016-06-13 20:04:58.528-04	2016-06-13 20:04:58.528-04
615	doug	yes	2016-06-13 20:11:32.327-04	2016-06-13 20:11:32.327-04
616	doug	svg	2016-06-13 20:11:34.751-04	2016-06-13 20:11:34.751-04
617	doug	dont worry lol	2016-06-13 20:11:45.731-04	2016-06-13 20:11:45.731-04
618	ilhami	:p	2016-06-13 20:15:52.37-04	2016-06-13 20:15:52.37-04
619	ilhami	:O	2016-06-13 20:35:04.323-04	2016-06-13 20:35:04.323-04
620	ilhami	no.. still not there	2016-06-13 20:35:09.848-04	2016-06-13 20:35:09.848-04
621	doug	I need this:	2016-06-13 20:40:09.968-04	2016-06-13 20:40:09.968-04
622	doug	 `':)': 0x263a,`	2016-06-13 20:40:48.711-04	2016-06-13 20:40:48.711-04
623	ilhami	ah okay.	2016-06-13 20:41:00.125-04	2016-06-13 20:41:00.125-04
624	ilhami	which ones do you have so far?	2016-06-13 20:41:17.281-04	2016-06-13 20:41:17.281-04
625	doug	':)': 0x263a, ':P': 0x1f61b	2016-06-13 20:41:49.791-04	2016-06-13 20:41:49.791-04
626	doug	refresh	2016-06-13 20:42:11.249-04	2016-06-13 20:42:11.249-04
627	doug	way too big	2016-06-13 20:42:28.29-04	2016-06-13 20:42:28.29-04
628	ilhami	where do you see the hex?	2016-06-13 20:42:41.743-04	2016-06-13 20:42:41.743-04
629	ilhami	U+1F60B \t	2016-06-13 20:42:43.65-04	2016-06-13 20:42:43.65-04
630	ilhami	I see this	2016-06-13 20:42:45.323-04	2016-06-13 20:42:45.323-04
631	ilhami	:P	2016-06-13 20:42:55.01-04	2016-06-13 20:42:55.01-04
632	ilhami	:)	2016-06-13 20:42:58.991-04	2016-06-13 20:42:58.991-04
633	doug	refresh	2016-06-13 20:44:27.201-04	2016-06-13 20:44:27.201-04
634	doug	:D	2016-06-13 20:44:37.051-04	2016-06-13 20:44:37.051-04
635	doug	:P	2016-06-13 20:44:40.407-04	2016-06-13 20:44:40.407-04
636	doug	ok it shows wrong for `:P`	2016-06-13 20:44:48.142-04	2016-06-13 20:44:48.142-04
637	ilhami	:p	2016-06-13 20:44:58.335-04	2016-06-13 20:44:58.335-04
638	ilhami	:P	2016-06-13 20:45:00.298-04	2016-06-13 20:45:00.298-04
639	ilhami	it should also work with lowercase p	2016-06-13 20:45:07.416-04	2016-06-13 20:45:07.416-04
640	ilhami	:p	2016-06-13 20:45:26.339-04	2016-06-13 20:45:26.339-04
641	ilhami	:P	2016-06-13 20:45:28.101-04	2016-06-13 20:45:28.101-04
642	ilhami	:)	2016-06-13 20:45:29.747-04	2016-06-13 20:45:29.747-04
643	ilhami	ah okay.. never mind. I understand the hex now	2016-06-13 20:46:52.66-04	2016-06-13 20:46:52.66-04
644	ilhami	':turkey:': 0x1F1F7 \t	2016-06-13 20:48:08.154-04	2016-06-13 20:48:08.154-04
645	ilhami	try this one :D	2016-06-13 20:48:11.806-04	2016-06-13 20:48:11.806-04
646	ilhami	:turkey	2016-06-13 20:48:36.852-04	2016-06-13 20:48:36.852-04
647	ilhami	:turkey:	2016-06-13 20:48:39.44-04	2016-06-13 20:48:39.44-04
648	doug	`:p` works now	2016-06-13 20:50:48.403-04	2016-06-13 20:50:48.403-04
649	doug	upper: :P lower: :p	2016-06-13 20:50:57.208-04	2016-06-13 20:50:57.208-04
650	doug	refresh	2016-06-13 20:51:14.764-04	2016-06-13 20:51:14.764-04
653	ilhami	yay.	2016-06-13 20:51:31.452-04	2016-06-13 20:51:31.452-04
654	ilhami	:turkey:	2016-06-13 20:51:35.596-04	2016-06-13 20:51:35.596-04
655	ilhami	doesn't work yet.	2016-06-13 20:51:39.724-04	2016-06-13 20:51:39.724-04
656	doug	adding...	2016-06-13 20:51:48.771-04	2016-06-13 20:51:48.771-04
657	ilhami	:turkey:	2016-06-13 20:52:33.231-04	2016-06-13 20:52:33.231-04
658	ilhami	0x1F1F9	2016-06-13 20:52:47.573-04	2016-06-13 20:52:47.573-04
659	ilhami	try this instead.	2016-06-13 20:52:50.71-04	2016-06-13 20:52:50.71-04
660	doug	aww. maybe not there, needs to be in this list https://doug16k.com/api/wschat/emoji-index	2016-06-13 20:53:12.948-04	2016-06-13 20:53:12.948-04
661	doug	you sure it isn't a sequence?	2016-06-13 20:53:56.927-04	2016-06-13 20:53:56.927-04
662	doug	let me see...	2016-06-13 20:54:02.437-04	2016-06-13 20:54:02.437-04
663	ilhami	http://unicode.org/emoji/charts/full-emoji-list.html#1f1f9_1f1f7	2016-06-13 20:54:15.608-04	2016-06-13 20:54:15.608-04
664	ilhami	it's this one	2016-06-13 20:54:19.111-04	2016-06-13 20:54:19.111-04
665	doug	ah, see how it needs two?	2016-06-13 20:54:38.934-04	2016-06-13 20:54:38.934-04
666	doug	you need [ 0x1f1f9, 0x1f1f7 ]	2016-06-13 20:54:48.047-04	2016-06-13 20:54:48.047-04
667	doug	1 sec	2016-06-13 20:54:56.463-04	2016-06-13 20:54:56.463-04
668	ilhami	oh.	2016-06-13 20:55:09.438-04	2016-06-13 20:55:09.438-04
669	ilhami	:turkey:	2016-06-13 20:56:22.346-04	2016-06-13 20:56:22.346-04
670	ilhami	does not work :/	2016-06-13 20:56:32.015-04	2016-06-13 20:56:32.015-04
671	doug	should work now :|	2016-06-13 20:58:48.41-04	2016-06-13 20:58:48.41-04
672	doug	let me step through it	2016-06-13 20:58:58.099-04	2016-06-13 20:58:58.099-04
673	ilhami	works now	2016-06-13 21:00:27.362-04	2016-06-13 21:00:27.362-04
674	ilhami	lol	2016-06-13 21:00:28.675-04	2016-06-13 21:00:28.675-04
675	ilhami	:turkey:	2016-06-13 21:00:30.328-04	2016-06-13 21:00:30.328-04
676	ilhami	but they are a bit too big dude	2016-06-13 21:00:36.35-04	2016-06-13 21:00:36.35-04
677	doug	yeah lol	2016-06-13 21:00:39.823-04	2016-06-13 21:00:39.823-04
678	ilhami	can you make them a bit smaller?	2016-06-13 21:00:41.075-04	2016-06-13 21:00:41.075-04
679	doug	1 sec	2016-06-13 21:00:42.909-04	2016-06-13 21:00:42.909-04
680	doug	:D :P :)	2016-06-13 21:02:52.084-04	2016-06-13 21:02:52.084-04
681	doug	refresh	2016-06-13 21:02:57.007-04	2016-06-13 21:02:57.007-04
682	doug	refresh again	2016-06-13 21:04:34.725-04	2016-06-13 21:04:34.725-04
683	doug-firefox	can you give me translation for :	2016-06-13 21:05:18.434-04	2016-06-13 21:05:18.434-04
684	doug-firefox	oops :/	2016-06-13 21:05:26.74-04	2016-06-13 21:05:26.74-04
685	doug-firefox	what does that mean exactly?	2016-06-13 21:05:41.163-04	2016-06-13 21:05:41.163-04
686	doug-firefox	disappointed?	2016-06-13 21:05:54.024-04	2016-06-13 21:05:54.024-04
687	doug-firefox	hang on, I need to refactor it to generate the regex to find them, from a convenient-to-edit table	2016-06-13 21:06:43.264-04	2016-06-13 21:06:43.264-04
688	doug-firefox	right now I have to edit 2 places	2016-06-13 21:06:50.063-04	2016-06-13 21:06:50.063-04
689	ilhami	brb.	2016-06-13 21:08:40.712-04	2016-06-13 21:08:40.712-04
690	doug	refresh	2016-06-13 21:21:56.314-04	2016-06-13 21:21:56.314-04
691	doug	now using proper lookup table	2016-06-13 21:22:00.586-04	2016-06-13 21:22:00.586-04
692	doug	now I need to fill it in with that annoying list...	2016-06-13 21:22:12.045-04	2016-06-13 21:22:12.045-04
693	doug	I wish it had a column with the `:D :)` code	2016-06-13 21:22:26.061-04	2016-06-13 21:22:26.061-04
694	doug	should I use this http://emojicodes.com/	2016-06-13 21:23:53.936-04	2016-06-13 21:23:53.936-04
695	doug	oh, :/ is unsure	2016-06-13 21:31:38.993-04	2016-06-13 21:31:38.993-04
696	doug	:(	2016-06-13 21:48:00.316-04	2016-06-13 21:48:00.316-04
697	doug	:)	2016-06-13 21:48:04.662-04	2016-06-13 21:48:04.662-04
698	doug	:D	2016-06-13 21:48:06.389-04	2016-06-13 21:48:06.389-04
699	doug	:turkey:	2016-06-13 21:48:49.495-04	2016-06-13 21:48:49.495-04
700	doug	:canada:	2016-06-13 21:49:34.92-04	2016-06-13 21:49:34.92-04
701	doug	oh, I have to sort the lookup table	2016-06-13 22:06:08.522-04	2016-06-13 22:06:08.522-04
702	doug	done	2016-06-13 22:11:17.554-04	2016-06-13 22:11:17.554-04
703	doug	here is the whole data set https://raw.githubusercontent.com/Ranks/emojione/master/emoji.json	2016-06-13 22:13:15.499-04	2016-06-13 22:13:15.499-04
704	doug	not happy with it	2016-06-13 22:14:50.915-04	2016-06-13 22:14:50.915-04
705	doug	oh good	2016-06-13 22:16:34.357-04	2016-06-13 22:16:34.357-04
706	doug	I see	2016-06-13 22:16:35.744-04	2016-06-13 22:16:35.744-04
707	ilhami	:D	2016-06-13 22:31:40.382-04	2016-06-13 22:31:40.382-04
708	ilhami	yay	2016-06-13 22:31:42.113-04	2016-06-13 22:31:42.113-04
709	ilhami	nice it works.	2016-06-13 22:31:45.034-04	2016-06-13 22:31:45.034-04
710	ilhami	:)	2016-06-13 22:31:46.996-04	2016-06-13 22:31:46.996-04
711	ilhami	:S	2016-06-13 22:31:48.147-04	2016-06-13 22:31:48.147-04
712	ilhami	:/	2016-06-13 22:31:50.777-04	2016-06-13 22:31:50.777-04
713	ilhami	:turkey:	2016-06-13 22:31:55.152-04	2016-06-13 22:31:55.152-04
714	ilhami	:canada:	2016-06-13 22:31:58.848-04	2016-06-13 22:31:58.848-04
715	ilhami	:greenland:	2016-06-13 22:32:03.724-04	2016-06-13 22:32:03.724-04
716	ilhami	lol	2016-06-13 22:32:05.437-04	2016-06-13 22:32:05.437-04
717	doug	almost every one...	2016-06-13 22:41:41.554-04	2016-06-13 22:41:41.554-04
718	doug	might still be bugs...	2016-06-13 22:41:58.653-04	2016-06-13 22:41:58.653-04
719	doug	oh crap	2016-06-13 22:57:28.922-04	2016-06-13 22:57:28.922-04
720	doug	halo? O:-)	2016-06-13 22:58:16.698-04	2016-06-13 22:58:16.698-04
721	ilhami	:D	2016-06-13 22:58:47.029-04	2016-06-13 22:58:47.029-04
722	ilhami	:S	2016-06-13 22:58:49.146-04	2016-06-13 22:58:49.146-04
723	ilhami	:/	2016-06-13 22:58:50.84-04	2016-06-13 22:58:50.84-04
724	ilhami	:P	2016-06-13 22:58:52.245-04	2016-06-13 22:58:52.245-04
725	ilhami	cool	2016-06-13 22:58:55.47-04	2016-06-13 22:58:55.47-04
726	ilhami	:turkey:	2016-06-13 22:58:58.099-04	2016-06-13 22:58:58.099-04
727	ilhami	???	2016-06-13 22:59:02.929-04	2016-06-13 22:59:02.929-04
728	ilhami	lol	2016-06-13 22:59:06-04	2016-06-13 22:59:06-04
729	doug	idk	2016-06-13 22:59:06.208-04	2016-06-13 22:59:06.208-04
730	doug	has whole open-emoji index now	2016-06-13 22:59:13.792-04	2016-06-13 22:59:13.792-04
731	doug	:flag_gl:	2016-06-13 22:59:20.903-04	2016-06-13 22:59:20.903-04
732	doug	:flag_ca:	2016-06-13 22:59:26.339-04	2016-06-13 22:59:26.339-04
733	doug	:canada:	2016-06-13 22:59:32.352-04	2016-06-13 22:59:32.352-04
734	doug	hmmm	2016-06-13 22:59:35.299-04	2016-06-13 22:59:35.299-04
735	doug	that thing is a turkey	2016-06-13 23:00:14.987-04	2016-06-13 23:00:14.987-04
736	doug	that people might eat	2016-06-13 23:00:25.102-04	2016-06-13 23:00:25.102-04
737	doug	:hand:	2016-06-13 23:00:35.887-04	2016-06-13 23:00:35.887-04
738	doug	idk them	2016-06-13 23:00:44.45-04	2016-06-13 23:00:44.45-04
739	ilhami	lol	2016-06-13 23:00:46.041-04	2016-06-13 23:00:46.041-04
740	doug	:turkey:	2016-06-13 23:00:53.427-04	2016-06-13 23:00:53.427-04
741	doug	:robot:	2016-06-13 23:00:58.05-04	2016-06-13 23:00:58.05-04
742	doug	:sheep:	2016-06-13 23:01:04.448-04	2016-06-13 23:01:04.448-04
743	doug	:baby:	2016-06-13 23:01:10.152-04	2016-06-13 23:01:10.152-04
744	doug	:man:	2016-06-13 23:01:12.849-04	2016-06-13 23:01:12.849-04
745	doug	:woman:	2016-06-13 23:01:17.035-04	2016-06-13 23:01:17.035-04
746	doug	happy now? lol	2016-06-13 23:04:39.904-04	2016-06-13 23:04:39.904-04
747	doug	thanks for the encouragement though	2016-06-13 23:04:47.091-04	2016-06-13 23:04:47.091-04
748	doug	has 1624 emojies now	2016-06-13 23:06:15.432-04	2016-06-13 23:06:15.432-04
749	doug	wait let me build reverse lookup to factor out aliases	2016-06-13 23:07:45.817-04	2016-06-13 23:07:45.817-04
750	doug	1834 emoticons	2016-06-13 23:08:51.845-04	2016-06-13 23:08:51.845-04
751	doug	weird	2016-06-13 23:10:52.616-04	2016-06-13 23:10:52.616-04
752	doug	there are more svg files in their zip than the json references	2016-06-13 23:11:10.632-04	2016-06-13 23:11:10.632-04
753	doug	:flag_ca:	2016-06-13 23:22:39.313-04	2016-06-13 23:22:39.313-04
754	doug	I see what's happening	2016-06-13 23:25:30.501-04	2016-06-13 23:25:30.501-04
755	doug	fixed	2016-06-13 23:29:36.898-04	2016-06-13 23:29:36.898-04
756	doug	:flag_tr:	2016-06-13 23:44:23.571-04	2016-06-13 23:44:23.571-04
757	doug	`:flag_tr:`	2016-06-13 23:44:33.571-04	2016-06-13 23:44:33.571-04
758	doug	I need a UI to insert emoji right?	2016-06-13 23:46:45.299-04	2016-06-13 23:46:45.299-04
759	doug	you could just click the face, point to keyword, point to country, and a menu pops out with all the countries	2016-06-13 23:48:05.586-04	2016-06-13 23:48:05.586-04
760	doug	and you click a country to insert the code into chat message field and dismiss menus	2016-06-13 23:48:28.403-04	2016-06-13 23:48:28.403-04
761	doug	these are the categories: *"symbols", "people", "nature", "food", "activity", "travel", "objects", "flags", "modifier"*	2016-06-13 23:52:10.527-04	2016-06-13 23:52:10.527-04
762	doug	yeah, lol this will be easy	2016-06-13 23:52:45.945-04	2016-06-13 23:52:45.945-04
763	doug	`Object.keys(v.reduce(function(r, e) { var a; r[e.category] = (a = r[e.category] || []); a.push(e); return r; }, {}))`	2016-06-13 23:54:16.837-04	2016-06-13 23:54:16.837-04
764	doug	my processing duration is up to 85ms, still fine for 128 messages	2016-06-13 23:58:08.625-04	2016-06-13 23:58:08.625-04
765	doug	I should switch it to flex layout too while I am at it	2016-06-14 00:01:11.135-04	2016-06-14 00:01:11.135-04
766	doug	add	2016-06-14 00:21:23.382-04	2016-06-14 00:21:23.382-04
767	doug	a	2016-06-14 00:25:22.563-04	2016-06-14 00:25:22.563-04
768	doug	test	2016-06-14 00:26:19.854-04	2016-06-14 00:26:19.854-04
769	doug	test2	2016-06-14 00:26:31.603-04	2016-06-14 00:26:31.603-04
770	doug	:(	2016-06-14 00:27:38.31-04	2016-06-14 00:27:38.31-04
771	doug	now using keyframes for reveal animation	2016-06-14 00:28:12.424-04	2016-06-14 00:28:12.424-04
772	doug	a	2016-06-14 00:35:54.811-04	2016-06-14 00:35:54.811-04
773	doug	new	2016-06-14 00:36:16.193-04	2016-06-14 00:36:16.193-04
774	doug	new	2016-06-14 00:36:36.564-04	2016-06-14 00:36:36.564-04
775	doug	ok, using all flex now	2016-06-14 00:37:17.366-04	2016-06-14 00:37:17.366-04
776	doug	fixed anim	2016-06-14 00:37:41.498-04	2016-06-14 00:37:41.498-04
777	doug	now, it is trivial to add new stuff to the layout, and make things appear/disappear or change size dynamically	2016-06-14 00:41:52.951-04	2016-06-14 00:41:52.951-04
778	doug-firefox	help me tweak up the layout	2016-06-14 00:44:03.697-04	2016-06-14 00:44:03.697-04
779	doug	:)	2016-06-14 00:47:21.771-04	2016-06-14 00:47:21.771-04
780	doug	test	2016-06-14 00:55:36.817-04	2016-06-14 00:55:36.817-04
781	doug	test again	2016-06-14 00:59:52.154-04	2016-06-14 00:59:52.154-04
782	doug	and again lol	2016-06-14 01:00:10.449-04	2016-06-14 01:00:10.449-04
783	doug	fixed again	2016-06-14 01:00:15.668-04	2016-06-14 01:00:15.668-04
784	doug	played with bottom fields	2016-06-14 01:23:02.151-04	2016-06-14 01:23:02.151-04
785	doug	fixed code highlighting	2016-06-14 01:27:48.169-04	2016-06-14 01:27:48.169-04
786	doug	I need to add multi-line messages, with shift enter	2016-06-14 01:28:23.448-04	2016-06-14 01:28:23.448-04
787	doug	:D	2016-06-14 01:29:35.194-04	2016-06-14 01:29:35.194-04
788	doug	neat	2016-06-14 01:39:18.437-04	2016-06-14 01:39:18.437-04
789	doug	a lot works :)	2016-06-14 01:50:52.14-04	2016-06-14 01:50:52.14-04
790	doug-firefox	firefox is working fine too	2016-06-14 02:12:54.464-04	2016-06-14 02:12:54.464-04
791	doug-firefox	brb in about 40 minutes	2016-06-14 02:13:24.23-04	2016-06-14 02:13:24.23-04
792	doug-firefox	back	2016-06-14 02:41:36.864-04	2016-06-14 02:41:36.864-04
793	doug	works well in android too	2016-06-14 05:36:56.491-04	2016-06-14 05:36:56.491-04
794	doug-ie	lol, works fine in IE too	2016-06-14 05:39:27.46-04	2016-06-14 05:39:27.46-04
795	doug-ie	:D	2016-06-14 05:40:48.674-04	2016-06-14 05:40:48.674-04
796	doug-android	Works on phone!	2016-06-14 06:26:43.385-04	2016-06-14 06:26:43.385-04
797	ilhami	hey	2016-06-14 06:27:29.808-04	2016-06-14 06:27:29.808-04
798	ilhami	I was sleeping.	2016-06-14 06:28:45.32-04	2016-06-14 06:28:45.32-04
799	ilhami	The chat needs some proper colors though	2016-06-14 06:28:58.156-04	2016-06-14 06:28:58.156-04
800	ilhami	it looks boring	2016-06-14 06:29:00.833-04	2016-06-14 06:29:00.833-04
801	ilhami	but it looks much better than before.	2016-06-14 06:29:06.511-04	2016-06-14 06:29:06.511-04
802	ilhami	maybe you should make some different themes	2016-06-14 06:29:19.206-04	2016-06-14 06:29:19.206-04
803	ilhami	and let the user choose	2016-06-14 06:29:24.568-04	2016-06-14 06:29:24.568-04
804	doug-ie	click the settings button	2016-06-14 06:43:37.027-04	2016-06-14 06:43:37.027-04
805	doug-ie	it switches the fon	2016-06-14 06:43:40.078-04	2016-06-14 06:43:40.078-04
806	doug-ie	t	2016-06-14 06:43:42.818-04	2016-06-14 06:43:42.818-04
807	doug-ie	yeah, exactly, you should be able to pick a theme	2016-06-14 06:44:17.455-04	2016-06-14 06:44:17.455-04
808	ilhami	next feature should be users	2016-06-14 07:00:24.591-04	2016-06-14 07:00:24.591-04
809	ilhami	Maybe a list of all rooms could be at the left hand side.	2016-06-14 07:41:24.523-04	2016-06-14 07:41:24.523-04
810	ilhami	:O	2016-06-14 08:04:42.109-04	2016-06-14 08:04:42.109-04
811	ilhami	:D	2016-06-14 08:04:44.379-04	2016-06-14 08:04:44.379-04
812	ilhami	:S	2016-06-14 08:04:45.595-04	2016-06-14 08:04:45.595-04
813	ilhami	make the font customizable.	2016-06-14 10:42:47.729-04	2016-06-14 10:42:47.729-04
814	doug	I was thinking of putting the entire google fonts library in here	2016-06-14 17:34:38.203-04	2016-06-14 17:34:38.203-04
815	doug	the serif font had huge margins, which is why my original code had too much line spacing	2016-06-14 17:36:07.309-04	2016-06-14 17:36:07.309-04
816	doug	:s	2016-06-14 17:52:44.641-04	2016-06-14 17:52:44.641-04
817	doug	hmm, that isn't in emoji database?	2016-06-14 17:52:56.517-04	2016-06-14 17:52:56.517-04
818	doug	test	2016-06-14 17:57:42.187-04	2016-06-14 17:57:42.187-04
819	doug	now highlights new messages	2016-06-14 17:58:14.14-04	2016-06-14 17:58:14.14-04
820	doug	on my machine, when I tab back to the browser, it reveals all of the new messages with the animation. now it keeps them highlighted for a couple of seconds so you can see exactly what is new at a glance	2016-06-14 18:01:22.156-04	2016-06-14 18:01:22.156-04
821	doug	tweaking timing	2016-06-14 18:01:52.539-04	2016-06-14 18:01:52.539-04
822	doug	again	2016-06-14 18:02:13.24-04	2016-06-14 18:02:13.24-04
823	doug	:D	2016-06-14 18:02:40.426-04	2016-06-14 18:02:40.426-04
824	doug	again?	2016-06-14 18:17:22.202-04	2016-06-14 18:17:22.202-04
825	doug	ok, now it only highlights the name and time, so you can read the new messages properly	2016-06-14 18:17:40.68-04	2016-06-14 18:17:40.68-04
826	doug		2016-06-14 18:30:10.714-04	2016-06-14 18:30:10.714-04
827	doug	lol empty message works	2016-06-14 18:30:15.588-04	2016-06-14 18:30:15.588-04
828	doug	fixed	2016-06-14 18:31:20.134-04	2016-06-14 18:31:20.134-04
829	doug	fixed major breakage	2016-06-14 23:13:55.091-04	2016-06-14 23:13:55.091-04
830	doug	cleaned up crappy deferred code it had for emojies	2016-06-14 23:14:35.643-04	2016-06-14 23:14:35.643-04
831	doug	don't mix native promises and `$.Deferred()` promises, just use $.Deferred ones and it works better	2016-06-14 23:15:05.872-04	2016-06-14 23:15:05.872-04
832	doug	:flag_ca:	2016-06-14 23:34:57.247-04	2016-06-14 23:34:57.247-04
833	doug	:swimmer:	2016-06-15 01:05:08.107-04	2016-06-15 01:05:08.107-04
834	doug	:pizza:	2016-06-15 01:10:18.238-04	2016-06-15 01:10:18.238-04
835	doug	try clicking the emoji button on the right	2016-06-15 01:17:10.805-04	2016-06-15 01:17:10.805-04
836	ilhami	nothing happens when I click the emoji button.	2016-06-15 03:12:55.232-04	2016-06-15 03:12:55.232-04
837	doug	weird, nothing happens in firefox	2016-06-15 03:19:49.943-04	2016-06-15 03:19:49.943-04
838	doug	oh I think I see why	2016-06-15 03:24:27.332-04	2016-06-15 03:24:27.332-04
839	doug	refresh	2016-06-15 03:25:19.126-04	2016-06-15 03:25:19.126-04
840	doug	lol, firefox is bad	2016-06-15 03:26:10.814-04	2016-06-15 03:26:10.814-04
841	doug	mine still hanging	2016-06-15 03:26:25.257-04	2016-06-15 03:26:25.257-04
842	doug	oh my bad	2016-06-15 03:26:47.765-04	2016-06-15 03:26:47.765-04
843	doug	was paused in debugger lol	2016-06-15 03:26:54.407-04	2016-06-15 03:26:54.407-04
844	ilhami	it works now but the smilies load too slowly.	2016-06-15 03:28:27.465-04	2016-06-15 03:28:27.465-04
845	doug-firefox	they load in 20ms on mine	2016-06-15 03:28:44.618-04	2016-06-15 03:28:44.618-04
846	doug-firefox	each one I mean	2016-06-15 03:28:51.773-04	2016-06-15 03:28:51.773-04
847	doug-firefox	I need to make them aggressively cache	2016-06-15 03:29:24.358-04	2016-06-15 03:29:24.358-04
848	ilhami	yeah	2016-06-15 03:29:29.698-04	2016-06-15 03:29:29.698-04
849	doug-firefox	they cache but it checks each one	2016-06-15 03:29:30.834-04	2016-06-15 03:29:30.834-04
850	doug-firefox	that's almost 3MB of emojies	2016-06-15 03:30:15.113-04	2016-06-15 03:30:15.113-04
851	doug	most emoji requests are < 10ms	2016-06-15 03:31:08.107-04	2016-06-15 03:31:08.107-04
852	doug	on my machine	2016-06-15 03:31:11.746-04	2016-06-15 03:31:11.746-04
853	doug	first time will take time, nothing I can do about that	2016-06-15 03:31:37.711-04	2016-06-15 03:31:37.711-04
854	doug	1800 images? it flies	2016-06-15 03:31:46.619-04	2016-06-15 03:31:46.619-04
855	doug	how slowly is "too slowly"	2016-06-15 03:32:06.549-04	2016-06-15 03:32:06.549-04
856	ilhami	when I click on the smily icon it responds too slowly.	2016-06-15 03:32:39.866-04	2016-06-15 03:32:39.866-04
857	ilhami	before I see the different categories.	2016-06-15 03:32:49.611-04	2016-06-15 03:32:49.611-04
858	doug	sorry, adding nearly 2000 elements to the page takes time	2016-06-15 03:33:12.625-04	2016-06-15 03:33:12.625-04
859	doug	sorry over 2000	2016-06-15 03:33:22.004-04	2016-06-15 03:33:22.004-04
860	doug	way over 2000	2016-06-15 03:33:25.363-04	2016-06-15 03:33:25.363-04
861	doug	is it bad?	2016-06-15 03:33:53.357-04	2016-06-15 03:33:53.357-04
862	ilhami	it's not horrible but it can be improved I'd say.	2016-06-15 03:34:40.526-04	2016-06-15 03:34:40.526-04
863	ilhami	How do Skype load theirs on their web app?	2016-06-15 03:35:03.918-04	2016-06-15 03:35:03.918-04
864	doug	skype chat is a joke	2016-06-15 03:35:55.025-04	2016-06-15 03:35:55.025-04
865	doug	if skype chat were any good I wouldn't have bothered with this one	2016-06-15 03:36:22.803-04	2016-06-15 03:36:22.803-04
866	ilhami	I think you should load all of emojies at the same time... They shouldn't load one by one if you understand what I mean	2016-06-15 03:36:29.556-04	2016-06-15 03:36:29.556-04
867	doug	I do 	2016-06-15 03:36:38.06-04	2016-06-15 03:36:38.06-04
868	doug	browsers dont freeze until all the images are loaded	2016-06-15 03:36:53.076-04	2016-06-15 03:36:53.076-04
869	doug	every image is there already as soon as you see the menu	2016-06-15 03:37:10.409-04	2016-06-15 03:37:10.409-04
870	ilhami	I know but I mean they shouldn't display untill all are fully loaded.. 	2016-06-15 03:37:16.853-04	2016-06-15 03:37:16.853-04
871	doug	lol	2016-06-15 03:37:20.316-04	2016-06-15 03:37:20.316-04
872	doug	too bad	2016-06-15 03:37:22.825-04	2016-06-15 03:37:22.825-04
873	doug	that is how browsers work	2016-06-15 03:37:26.172-04	2016-06-15 03:37:26.172-04
874	doug	I dont want broken bones in car crashes either	2016-06-15 03:37:48.569-04	2016-06-15 03:37:48.569-04
875	ilhami	you can delay the displaying of them	2016-06-15 03:37:53.443-04	2016-06-15 03:37:53.443-04
876	ilhami	untill all are fully loaded?	2016-06-15 03:38:00.95-04	2016-06-15 03:38:00.95-04
877	ilhami	they shouldn't render 1 by 1	2016-06-15 03:38:08.46-04	2016-06-15 03:38:08.46-04
878	doug	dude	2016-06-15 03:38:19.563-04	2016-06-15 03:38:19.563-04
879	doug	every image is there	2016-06-15 03:38:23.131-04	2016-06-15 03:38:23.131-04
880	doug	what am I supposed to do	2016-06-15 03:38:35.627-04	2016-06-15 03:38:35.627-04
881	doug	ah	2016-06-15 03:39:11.793-04	2016-06-15 03:39:11.793-04
882	ilhami	and I shouldn't have to click on the smilies icon again to dismiss the dialog	2016-06-15 03:39:17.453-04	2016-06-15 03:39:17.453-04
883	doug	if I specify width and height on them all	2016-06-15 03:39:18.389-04	2016-06-15 03:39:18.389-04
884	doug	why? is it in the way?	2016-06-15 03:39:36.181-04	2016-06-15 03:39:36.181-04
885	ilhami	when I click outside the menu it should close	2016-06-15 03:39:41.903-04	2016-06-15 03:39:41.903-04
886	ilhami	now I have to toggle the emoji button :D	2016-06-15 03:40:05.049-04	2016-06-15 03:40:05.049-04
887	doug	so you have to keep clicking it every time you use it?	2016-06-15 03:40:33.115-04	2016-06-15 03:40:33.115-04
888	doug	it's only there to browse them and find the short code	2016-06-15 03:40:50.319-04	2016-06-15 03:40:50.319-04
889	doug	I do intend to add click-to-add	2016-06-15 03:40:58.305-04	2016-06-15 03:40:58.305-04
890	ilhami	oh.. I thought click to add worked lol	2016-06-15 03:41:16.6-04	2016-06-15 03:41:16.6-04
891	doug	 click-outside-to-dismiss  is a pain in the butt	2016-06-15 03:41:29.374-04	2016-06-15 03:41:29.374-04
892	doug	W3C retards can't seem to add a menu to this crap we call a browser	2016-06-15 03:41:59.373-04	2016-06-15 03:41:59.373-04
893	doug	so we waste hours on divs	2016-06-15 03:42:23.687-04	2016-06-15 03:42:23.687-04
894	ilhami	ye	2016-06-15 03:42:48.136-04	2016-06-15 03:42:48.136-04
895	doug	and `ul`s of `li`s that have `ul`s of `li`s	2016-06-15 03:42:51.998-04	2016-06-15 03:42:51.998-04
896	ilhami	also you should probably work on the authentication now	2016-06-15 03:43:04.155-04	2016-06-15 03:43:04.155-04
897	ilhami	emojis can wait imo	2016-06-15 03:43:16.433-04	2016-06-15 03:43:16.433-04
898	doug	ya	2016-06-15 03:43:43.313-04	2016-06-15 03:43:43.313-04
899	ilhami	I want to be able to see the users in the room	2016-06-15 03:44:00.748-04	2016-06-15 03:44:00.748-04
900	doug	you  wanted emoji immediately lol	2016-06-15 03:44:05.67-04	2016-06-15 03:44:05.67-04
901	ilhami	and I want to be able to private chat each person	2016-06-15 03:44:10.157-04	2016-06-15 03:44:10.157-04
902	doug	@ilhami like this?	2016-06-15 03:44:22.445-04	2016-06-15 03:44:22.445-04
903	ilhami	or in a different window	2016-06-15 03:44:36.213-04	2016-06-15 03:44:36.213-04
904	doug	what sound effect	2016-06-15 03:45:02.996-04	2016-06-15 03:45:02.996-04
905	doug	for notification?	2016-06-15 03:45:08.425-04	2016-06-15 03:45:08.425-04
906	ilhami	@someone shouldn't be private chat but rather it should be mentioning	2016-06-15 03:45:08.619-04	2016-06-15 03:45:08.619-04
907	doug	oh you mean create a chat room with someone	2016-06-15 03:45:26.838-04	2016-06-15 03:45:26.838-04
908	ilhami	yeah	2016-06-15 03:45:31.279-04	2016-06-15 03:45:31.279-04
909	doug	do you prefer the sans-serif font?	2016-06-15 03:45:54.154-04	2016-06-15 03:45:54.154-04
910	doug	arial-like one	2016-06-15 03:46:12.76-04	2016-06-15 03:46:12.76-04
911	ilhami	you should be able to disable and enable notification sound	2016-06-15 03:46:23.353-04	2016-06-15 03:46:23.353-04
912	doug	yeah	2016-06-15 03:46:28.232-04	2016-06-15 03:46:28.232-04
913	doug	what sound though?	2016-06-15 03:46:31.797-04	2016-06-15 03:46:31.797-04
914	doug	know any decent open source sound sites?	2016-06-15 03:46:39.817-04	2016-06-15 03:46:39.817-04
915	doug	the stack overflow one is a cacophony	2016-06-15 03:47:08.721-04	2016-06-15 03:47:08.721-04
916	ilhami	https://www.freesound.org/	2016-06-15 03:47:13.76-04	2016-06-15 03:47:13.76-04
917	ilhami	maybe this one?	2016-06-15 03:47:16.079-04	2016-06-15 03:47:16.079-04
918	doug	https://www.freesound.org/search/?q=notify  suggestions?	2016-06-15 03:48:10.809-04	2016-06-15 03:48:10.809-04
919	ilhami	https://www.freesound.org/people/TheGertz/sounds/235911/	2016-06-15 03:49:59.208-04	2016-06-15 03:49:59.208-04
920	ilhami	use this one	2016-06-15 03:50:01.073-04	2016-06-15 03:50:01.073-04
921	ilhami	and please make global notifications work where you can see you have got a message even from another tab	2016-06-15 03:53:26.226-04	2016-06-15 03:53:26.226-04
922	doug	oh that!	2016-06-15 03:54:56.75-04	2016-06-15 03:54:56.75-04
923	doug	I haven't tried that before. that would be very cool	2016-06-15 03:55:07.041-04	2016-06-15 03:55:07.041-04
924	ilhami	ye.. but of course the user needs to allow that	2016-06-15 03:55:10.324-04	2016-06-15 03:55:10.324-04
925	doug	you mean like email notification	2016-06-15 03:55:12.131-04	2016-06-15 03:55:12.131-04
926	ilhami	it's like a push message or what you call it	2016-06-15 03:55:35.41-04	2016-06-15 03:55:35.41-04
927	ilhami	:D	2016-06-15 03:55:36.393-04	2016-06-15 03:55:36.393-04
928	ilhami	you see it in the top right corner normally	2016-06-15 03:55:46.387-04	2016-06-15 03:55:46.387-04
929	ilhami	but just take one thing at a time :D	2016-06-15 03:59:02.788-04	2016-06-15 03:59:02.788-04
930	doug-firefox	yeah, I'm really interested in that, since I can't stand not knowing how a thing works, lol	2016-06-15 04:01:26.335-04	2016-06-15 04:01:26.335-04
931	doug-firefox	I have to try every API :D	2016-06-15 04:01:37.213-04	2016-06-15 04:01:37.213-04
932	ilhami	I think that feature is a gimmick :D	2016-06-15 04:02:19.645-04	2016-06-15 04:02:19.645-04
933	ilhami	I'd rather want the user list honestly.	2016-06-15 04:02:25.849-04	2016-06-15 04:02:25.849-04
934	doug-firefox	cool! https://developer.mozilla.org/en-US/docs/Web/API/notification/Notification	2016-06-15 04:02:57.652-04	2016-06-15 04:02:57.652-04
935	doug-firefox	auth comes before user list, since "user"	2016-06-15 04:03:22.324-04	2016-06-15 04:03:22.324-04
936	doug-firefox	I have auth half done	2016-06-15 04:03:38.462-04	2016-06-15 04:03:38.462-04
937	doug-firefox	@doug-firefox test	2016-06-15 04:14:03.989-04	2016-06-15 04:14:03.989-04
938	doug	@doug test	2016-06-15 04:15:10.359-04	2016-06-15 04:15:10.359-04
939	doug	lol, nothing seems to happen	2016-06-15 04:15:24.848-04	2016-06-15 04:15:24.848-04
940	doug	yeah, screw notification for now	2016-06-15 04:15:37.801-04	2016-06-15 04:15:37.801-04
941	doug	need auth	2016-06-15 04:15:59.333-04	2016-06-15 04:15:59.333-04
942	doug	this isn't a toy project you know. I am really implementing a tool for me to keep track of my mentoring sessions	2016-06-15 04:16:49.257-04	2016-06-15 04:16:49.257-04
943	doug	this replaces skype for chat	2016-06-15 04:17:04.304-04	2016-06-15 04:17:04.304-04
944	doug	yeah that is funny how chrome does that with the images	2016-06-15 04:20:44.929-04	2016-06-15 04:20:44.929-04
945	doug	it's trying to be smart by ignoring images on `display: none` element	2016-06-15 04:21:15.77-04	2016-06-15 04:21:15.77-04
946	doug	lol, `Notification` is fully standard but nobody actually supports it	2016-06-15 04:26:33.049-04	2016-06-15 04:26:33.049-04
947	doug	in chrome you have to use webkit prefixed stuff	2016-06-15 04:26:41.82-04	2016-06-15 04:26:41.82-04
948	doug	firefox bugs sit and rot for years https://bugzilla.mozilla.org/show_bug.cgi?id=875114	2016-06-15 15:31:47.762-04	2016-06-15 15:31:47.762-04
949	doug	that's why firefox is crap	2016-06-15 15:31:52.941-04	2016-06-15 15:31:52.941-04
950	doug	the embarrassment of hard coding 4 seconds should have motivated someone. nobody cares because chrome is so much better. if they don't watch out, firefox will be abandoned and nobody will want to contribute to crap	2016-06-15 15:33:19.55-04	2016-06-15 15:33:19.55-04
951	doug	on the other hand, there are probably 999 people that can't fix it for every 1000 people that file the bug :(	2016-06-15 15:38:06.885-04	2016-06-15 15:38:06.885-04
952	doug	but 3 years for a timeout? come on	2016-06-15 15:38:49.073-04	2016-06-15 15:38:49.073-04
953	doug	3 years and counting...	2016-06-15 15:38:57.889-04	2016-06-15 15:38:57.889-04
954	doug	fixing the emoticon menu to insert 	2016-06-15 17:55:25.031-04	2016-06-15 17:55:25.031-04
955	doug	oh! I see what you mean!	2016-06-15 18:46:15.576-04	2016-06-15 18:46:15.576-04
956	doug	the images, I should overlay a "loading" thing, and fade it out after all load events complete	2016-06-15 18:46:35.5-04	2016-06-15 18:46:35.5-04
957	doug	yeah that is not good	2016-06-15 18:46:53.901-04	2016-06-15 18:46:53.901-04
958	doug	I fixed emoticon load	2016-06-15 19:56:41.075-04	2016-06-15 19:56:41.075-04
959	doug	ok, I massively optimized the emoji menu	2016-06-15 20:15:38.706-04	2016-06-15 20:15:38.706-04
960	doug	it defers loading until the menu item is visible	2016-06-15 20:15:58.365-04	2016-06-15 20:15:58.365-04
961	doug	gets stuck Loading... :(	2016-06-15 21:03:30.094-04	2016-06-15 21:03:30.094-04
962	doug	fixed	2016-06-15 21:26:11.389-04	2016-06-15 21:26:11.389-04
963	doug	ok now emoji load is bulletproofed	2016-06-15 23:19:58.7-04	2016-06-15 23:19:58.7-04
964	doug	once it starts the load, it won't remove it if it is not finished. it's awesome though, because if you mouse off it briefly and back on, it is still going	2016-06-15 23:22:33.218-04	2016-06-15 23:22:33.218-04
965	doug	only zero or one menu is in the document at any time	2016-06-15 23:22:55.603-04	2016-06-15 23:22:55.603-04
966	doug	but it is cached off-document after it is created	2016-06-15 23:23:07.108-04	2016-06-15 23:23:07.108-04
967	doug	it will give up and remove the overlay if no emoji `img` load finishes for 10 seconds straight	2016-06-15 23:23:41.466-04	2016-06-15 23:23:41.466-04
968	user1300433317	hi	2016-06-16 00:26:15.254-04	2016-06-16 00:26:15.254-04
969	doug	emoji ui is super fast in chrome	2016-06-16 01:17:35.275-04	2016-06-16 01:17:35.275-04
970	doug	I should go check FF though	2016-06-16 01:17:39.893-04	2016-06-16 01:17:39.893-04
971	doug-firefox	not quite as snappy as chrome but good though. try it :D	2016-06-16 01:18:28.581-04	2016-06-16 01:18:28.581-04
972	doug	made emojies a bit bigger and fixed line height and adjusted message margin and adjusted animation to match	2016-06-16 01:21:07.236-04	2016-06-16 01:21:07.236-04
973	doug	looks perfect	2016-06-16 01:21:12.166-04	2016-06-16 01:21:12.166-04
974	doug	try new indication	2016-06-16 01:28:09.736-04	2016-06-16 01:28:09.736-04
975	doug	of own messages I mean	2016-06-16 01:28:18.495-04	2016-06-16 01:28:18.495-04
976	doug	fixed alignment of timestamp a sender a bit	2016-06-16 01:29:44.279-04	2016-06-16 01:29:44.279-04
977	doug	is animation of new items silky smooth for you too?	2016-06-16 01:30:03.505-04	2016-06-16 01:30:03.505-04
978	doug	skype's instantly appearing text looks weird to me now	2016-06-16 01:30:34.928-04	2016-06-16 01:30:34.928-04
979	doug	brb 25min	2016-06-16 01:30:52.449-04	2016-06-16 01:30:52.449-04
980	doug	back	2016-06-16 01:50:29.945-04	2016-06-16 01:50:29.945-04
981	doug	I am adding a thing to download all of the emojies in one big request. should compress like crazy	2016-06-16 02:12:19.407-04	2016-06-16 02:12:19.407-04
982	doug	ouch, it is 4.3MB, 1.2MB gzipped	2016-06-16 02:40:04.415-04	2016-06-16 02:40:04.415-04
983	doug	https://doug16k.com/api/wschat/emoji-package	2016-06-16 02:40:08.834-04	2016-06-16 02:40:08.834-04
984	doug	:tractor::mens:	2016-06-16 03:10:48.024-04	2016-06-16 03:10:48.024-04
985	doug	click to pick emoji works	2016-06-16 03:10:54.797-04	2016-06-16 03:10:54.797-04
986	doug	:flag_md::radioactive::vs::poodle:	2016-06-16 03:23:22.429-04	2016-06-16 03:23:22.429-04
987	doug	:pizza:	2016-06-16 03:34:32.231-04	2016-06-16 03:34:32.231-04
988	doug	@doug mentioning with a longer message that should make the size of the notification window because I am running on with a deliberately long message	2016-06-16 04:02:46.318-04	2016-06-16 04:02:46.318-04
989	ilhami	emojis are much better now. :D	2016-06-16 04:05:48.08-04	2016-06-16 04:05:48.08-04
990	ilhami	:sweet_potato:	2016-06-16 04:05:53.979-04	2016-06-16 04:05:53.979-04
991	doug	cool	2016-06-16 04:08:32.082-04	2016-06-16 04:08:32.082-04
992	doug	@ilhami turn on notification and refresh	2016-06-16 04:08:39.84-04	2016-06-16 04:08:39.84-04
993	ilhami	there are still places for improvement of course.	2016-06-16 04:08:53.438-04	2016-06-16 04:08:53.438-04
994	ilhami	mention me	2016-06-16 04:09:06.634-04	2016-06-16 04:09:06.634-04
995	doug	I did	2016-06-16 04:09:14.424-04	2016-06-16 04:09:14.424-04
996	doug	did you allow notification?	2016-06-16 04:09:35.715-04	2016-06-16 04:09:35.715-04
997	doug	check it at top right	2016-06-16 04:09:41.743-04	2016-06-16 04:09:41.743-04
998	ilhami	ye	2016-06-16 04:10:07.738-04	2016-06-16 04:10:07.738-04
999	ilhami	 don't get anything	2016-06-16 04:10:10.831-04	2016-06-16 04:10:10.831-04
1000	doug	if you reload it will notify	2016-06-16 04:10:13.441-04	2016-06-16 04:10:13.441-04
1001	doug	do you like new own-message indication?	2016-06-16 04:10:29.77-04	2016-06-16 04:10:29.77-04
1002	ilhami	try to mention me again while I am in another tab.	2016-06-16 04:10:59.178-04	2016-06-16 04:10:59.178-04
1003	doug	@ilhami testing notification	2016-06-16 04:11:12.269-04	2016-06-16 04:11:12.269-04
1004	ilhami	works.	2016-06-16 04:11:19.102-04	2016-06-16 04:11:19.102-04
1005	ilhami	but I have to refresh	2016-06-16 04:11:22.747-04	2016-06-16 04:11:22.747-04
1006	doug	awesome	2016-06-16 04:11:22.998-04	2016-06-16 04:11:22.998-04
1007	ilhami	not optimal	2016-06-16 04:11:25.317-04	2016-06-16 04:11:25.317-04
1008	doug	no you don't have to refresh	2016-06-16 04:11:31.051-04	2016-06-16 04:11:31.051-04
1009	ilhami	oh	2016-06-16 04:11:35.064-04	2016-06-16 04:11:35.064-04
1010	doug	you shouldn't	2016-06-16 04:11:36.089-04	2016-06-16 04:11:36.089-04
1011	doug	it notifies you for everything it receives when loading (for debug)	2016-06-16 04:11:53.553-04	2016-06-16 04:11:53.553-04
1012	doug	@ilhami work now?	2016-06-16 04:12:08.67-04	2016-06-16 04:12:08.67-04
1013	doug	@doug test	2016-06-16 04:12:14.179-04	2016-06-16 04:12:14.179-04
1014	doug	works for me	2016-06-16 04:12:16.971-04	2016-06-16 04:12:16.971-04
1015	ilhami	@ilhami	2016-06-16 04:12:23.139-04	2016-06-16 04:12:23.139-04
1016	ilhami	ye it works.	2016-06-16 04:12:30.613-04	2016-06-16 04:12:30.613-04
1017	ilhami	awesome.	2016-06-16 04:12:33.244-04	2016-06-16 04:12:33.244-04
1018	ilhami	and nice indicator	2016-06-16 04:12:36.227-04	2016-06-16 04:12:36.227-04
1019	doug	thanks	2016-06-16 04:12:42.226-04	2016-06-16 04:12:42.226-04
1020	ilhami	Now auth please	2016-06-16 04:12:57.824-04	2016-06-16 04:12:57.824-04
1021	doug	ok I'd call emoji finished now	2016-06-16 04:13:03.046-04	2016-06-16 04:13:03.046-04
1022	ilhami	I want to be able to register or use as a guest	2016-06-16 04:13:07.652-04	2016-06-16 04:13:07.652-04
1023	doug	yeah	2016-06-16 04:13:13.109-04	2016-06-16 04:13:13.109-04
1024	doug	I also will play sound for notification	2016-06-16 04:13:52.112-04	2016-06-16 04:13:52.112-04
1025	doug	it is supposed to be super easy: `var sound = new Audio(url); sound.play();`	2016-06-16 04:14:18.036-04	2016-06-16 04:14:18.036-04
1026	ilhami	then do it.	2016-06-16 04:14:34.014-04	2016-06-16 04:14:34.014-04
1027	ilhami	would be cool with tabs so you can have multiple chat windows at the same time. You can be in more rooms at the same time.	2016-06-16 04:15:42.447-04	2016-06-16 04:15:42.447-04
1028	ilhami	They could be at the left hand side	2016-06-16 04:16:27.781-04	2016-06-16 04:16:27.781-04
1029	doug	[lol](http://stackoverflow.com/questions/9419263/playing-audio-with-javascript#comment46838958_18628124)	2016-06-16 04:16:28.026-04	2016-06-16 04:16:28.026-04
1030	doug	hey yeah	2016-06-16 04:16:37.39-04	2016-06-16 04:16:37.39-04
1031	doug	that would be cool	2016-06-16 04:16:43.767-04	2016-06-16 04:16:43.767-04
1032	doug	left?	2016-06-16 04:16:45.582-04	2016-06-16 04:16:45.582-04
1033	doug	waste of space underneath them right?	2016-06-16 04:16:55.218-04	2016-06-16 04:16:55.218-04
1034	doug	tabs across top will use space more efficiently	2016-06-16 04:17:02.361-04	2016-06-16 04:17:02.361-04
1035	ilhami	then at top	2016-06-16 04:17:05.216-04	2016-06-16 04:17:05.216-04
1036	doug	configurable is possible	2016-06-16 04:17:19.712-04	2016-06-16 04:17:19.712-04
1037	ilhami	ye everything should be customizable.	2016-06-16 04:17:37.593-04	2016-06-16 04:17:37.593-04
1038	doug	where I have "Prototype room" that could be a tab-looking thing	2016-06-16 04:19:14.016-04	2016-06-16 04:19:14.016-04
1039	ilhami	yep.	2016-06-16 04:19:31.566-04	2016-06-16 04:19:31.566-04
1040	ilhami	make them look cool :P	2016-06-16 04:20:23.852-04	2016-06-16 04:20:23.852-04
1041	doug	:D	2016-06-16 04:20:27.605-04	2016-06-16 04:20:27.605-04
1042	ilhami	I don't want boring tabs.	2016-06-16 04:20:29.683-04	2016-06-16 04:20:29.683-04
1043	doug	define cool	2016-06-16 04:20:34.758-04	2016-06-16 04:20:34.758-04
1044	ilhami	the GUI of the chat can still be improved	2016-06-16 04:21:21.679-04	2016-06-16 04:21:21.679-04
1045	doug	:(	2016-06-16 04:21:34.018-04	2016-06-16 04:21:34.018-04
1046	ilhami	the top is not pretty :D	2016-06-16 04:21:47.926-04	2016-06-16 04:21:47.926-04
1047	ilhami	the blue bar	2016-06-16 04:21:50.501-04	2016-06-16 04:21:50.501-04
1048	ilhami	and the change room settings buttons	2016-06-16 04:21:57.668-04	2016-06-16 04:21:57.668-04
1049	ilhami	they are too small	2016-06-16 04:22:06.601-04	2016-06-16 04:22:06.601-04
1050	ilhami	also the nick doesn't seem to be centered vertically in the indicator	2016-06-16 04:24:30.393-04	2016-06-16 04:24:30.393-04
1051	doug	?	2016-06-16 04:31:05.358-04	2016-06-16 04:31:05.358-04
1052	doug	?	2016-06-16 04:31:33.456-04	2016-06-16 04:31:33.456-04
1053	ilhami	.	2016-06-16 04:36:30.711-04	2016-06-16 04:36:30.711-04
1054	doug	ok, initial load is broken	2016-06-16 04:36:59.493-04	2016-06-16 04:36:59.493-04
1055	ilhami	brb	2016-06-16 04:37:20.874-04	2016-06-16 04:37:20.874-04
1056	doug	k	2016-06-16 04:37:29.467-04	2016-06-16 04:37:29.467-04
1057	doug	@ilhami fixed	2016-06-16 04:43:11.785-04	2016-06-16 04:43:11.785-04
1058	doug	@doug sound test	2016-06-16 04:51:09.791-04	2016-06-16 04:51:09.791-04
1059	doug	lol, works	2016-06-16 04:51:13.155-04	2016-06-16 04:51:13.155-04
1060	doug	refresh	2016-06-16 04:51:22.186-04	2016-06-16 04:51:22.186-04
1061	doug	it lets one sound every 4 seconds. if you try to plonk spam, it won't	2016-06-16 04:52:07.782-04	2016-06-16 04:52:07.782-04
1062	doug	let me know when you get back and I'll plonk you	2016-06-16 04:52:38.05-04	2016-06-16 04:52:38.05-04
1063	doug	brb	2016-06-16 04:54:22.392-04	2016-06-16 04:54:22.392-04
1064	doug	back	2016-06-16 04:58:24.606-04	2016-06-16 04:58:24.606-04
1065	doug	@doug test	2016-06-16 05:01:15.188-04	2016-06-16 05:01:15.188-04
1066	doug	fixed alignment of name and timestamp	2016-06-16 05:06:00.873-04	2016-06-16 05:06:00.873-04
1067	doug	let me know when you get back and I'll plonk you	2016-06-16 05:06:14.947-04	2016-06-16 05:06:14.947-04
1068	doug	sound works :D	2016-06-16 05:06:25.819-04	2016-06-16 05:06:25.819-04
1069	doug	@doug test again	2016-06-16 05:07:44.528-04	2016-06-16 05:07:44.528-04
1070	doug	@doug and again	2016-06-16 05:07:50.886-04	2016-06-16 05:07:50.886-04
1071	doug	yay	2016-06-16 05:07:53.799-04	2016-06-16 05:07:53.799-04
1072	doug	;)	2016-06-16 05:55:16.034-04	2016-06-16 05:55:16.034-04
1073	doug	@doug test	2016-06-16 06:01:00.184-04	2016-06-16 06:01:00.184-04
1074	ilhami	sdas	2016-06-16 08:45:25.293-04	2016-06-16 08:45:25.293-04
1075	ilhami	ad	2016-06-16 08:45:26.683-04	2016-06-16 08:45:26.683-04
1076	ilhami	@ilhami	2016-06-16 08:45:31.535-04	2016-06-16 08:45:31.535-04
1077	ilhami	the sound only works on mention.. which is fine	2016-06-16 08:45:40.923-04	2016-06-16 08:45:40.923-04
1078	doug-ie	@doug-ie tested sound from ie	2016-06-16 13:32:00.098-04	2016-06-16 13:32:00.098-04
1079	doug-ie	yay!	2016-06-16 13:32:04.655-04	2016-06-16 13:32:04.655-04
1080	doug-ie	uh oh lol, I just relize it matched prefix :D	2016-06-16 13:33:47.342-04	2016-06-16 13:33:47.342-04
1081	doug	@doug-ie test ie sound	2016-06-16 13:38:46.438-04	2016-06-16 13:38:46.438-04
1082	doug	@doug-ie whole word only test	2016-06-16 16:11:38.469-04	2016-06-16 16:11:38.469-04
1083	doug	@doug whole word only test	2016-06-16 16:11:45.696-04	2016-06-16 16:11:45.696-04
1084	doug-ie	@doug-ie test ie sound again	2016-06-16 16:26:07.909-04	2016-06-16 16:26:07.909-04
1085	doug-ie	lmao, AUDIO/VIDEO: Unknown MIME type	2016-06-16 16:26:28.996-04	2016-06-16 16:26:28.996-04
1086	doug-ie	microsoft is the only company that doesn't support microsoft's audio format: WAV	2016-06-16 16:26:45.219-04	2016-06-16 16:26:45.219-04
1087	doug-ie	how asinine can it get?	2016-06-16 16:26:49.733-04	2016-06-16 16:26:49.733-04
1088	doug-ie	I'll have to convert that notification to mp3 I guess	2016-06-16 16:27:28.327-04	2016-06-16 16:27:28.327-04
1089	doug-ie	it's better anyway, much smaller	2016-06-16 16:27:36.565-04	2016-06-16 16:27:36.565-04
1090	doug	original: 117KB, mp3: 11KB	2016-06-16 16:32:23.863-04	2016-06-16 16:32:23.863-04
1091	doug	@doug mp3 test	2016-06-16 16:34:06.427-04	2016-06-16 16:34:06.427-04
1092	doug	@doug-ie plonk ie	2016-06-16 16:35:10.071-04	2016-06-16 16:35:10.071-04
1093	doug	yay!!!	2016-06-16 16:35:16.82-04	2016-06-16 16:35:16.82-04
1094	doug	ie sound works	2016-06-16 16:35:18.931-04	2016-06-16 16:35:18.931-04
1095	doug	@doug-firefox test sound	2016-06-16 16:36:21.143-04	2016-06-16 16:36:21.143-04
1096	doug	yay!	2016-06-16 16:36:24.217-04	2016-06-16 16:36:24.217-04
1097	doug-firefox	@doug-firefox notification test	2016-06-16 17:02:27.775-04	2016-06-16 17:02:27.775-04
1098	doug-firefox	cool, the icon works in firefox	2016-06-16 17:02:37.671-04	2016-06-16 17:02:37.671-04
1099	doug-firefox	@doug-firefox notification test	2016-06-16 17:03:02.688-04	2016-06-16 17:03:02.688-04
1100	doug-ie	click to insert emoji is broken in ie	2016-06-16 18:32:12.707-04	2016-06-16 18:32:12.707-04
1101	doug-ie	a	2016-06-16 18:42:23.216-04	2016-06-16 18:42:23.216-04
1102	doug-ie	:gear:	2016-06-16 20:01:40-04	2016-06-16 20:01:40-04
1103	doug-ie	:gear:	2016-06-16 20:02:13.974-04	2016-06-16 20:02:13.974-04
1104	doug-ie	:station:	2016-06-16 20:05:57.123-04	2016-06-16 20:05:57.123-04
1105	doug-ie	fixed `Math.sign` missing on ie	2016-06-16 20:06:05.305-04	2016-06-16 20:06:05.305-04
1106	doug-win-firefox	hi	2016-06-16 20:35:13.475-04	2016-06-16 20:35:13.475-04
1107	doug-win-firefox	:O	2016-06-16 20:35:24.199-04	2016-06-16 20:35:24.199-04
1108	doug-win-firefox	oh! there should be a thing to reply to a message, and hovering highlights the other message it replies to	2016-06-16 20:48:19.066-04	2016-06-16 20:48:19.066-04
1109	doug-win-firefox	after auth	2016-06-16 20:48:39.911-04	2016-06-16 20:48:39.911-04
1110	doug	should I limit username to 12 chars?	2016-06-16 21:28:56.19-04	2016-06-16 21:28:56.19-04
1111	doug	yeah, 12 is tons	2016-06-16 21:29:13.633-04	2016-06-16 21:29:13.633-04
1112	doug	16	2016-06-17 00:46:09.533-04	2016-06-17 00:46:09.533-04
1113	doug	test	2016-06-17 04:13:19.648-04	2016-06-17 04:13:19.648-04
1114	doug	page up down will scroll the history and ctrl-home/ctrl-end scrolls to start/end	2016-06-17 04:36:10.464-04	2016-06-17 04:36:10.464-04
1115	doug	test	2016-06-17 04:41:43.446-04	2016-06-17 04:41:43.446-04
1116	doug	put a limit on send retry	2016-06-17 04:52:40.619-04	2016-06-17 04:52:40.619-04
1117	doug	it tries immediately, and retries after 100ms, after 200ms, after 400ms, after 800ms, after 1600ms, after 3200ms, then gives up. Total time = 6.3 seconds	2016-06-17 04:55:10.386-04	2016-06-17 04:55:10.386-04
1118	user1738931131	Testing	2016-06-17 18:05:24.996-04	2016-06-17 18:05:24.996-04
1119	Marshall	Test	2016-06-17 18:05:29.827-04	2016-06-17 18:05:29.827-04
1120	Marshall	Alert on	2016-06-17 18:05:40.152-04	2016-06-17 18:05:40.152-04
1121	Marshall	:tokyo_tower:	2016-06-17 18:06:44.508-04	2016-06-17 18:06:44.508-04
1122	doug	Hi :)	2016-06-17 18:09:16.742-04	2016-06-17 18:09:16.742-04
1123	doug	@Marshall notifying you	2016-06-17 18:09:28.712-04	2016-06-17 18:09:28.712-04
1124	Marshall	nice lol- got alert	2016-06-17 18:09:54.927-04	2016-06-17 18:09:54.927-04
1125	doug	it supports markdown *italic* and **bold**	2016-06-17 18:10:41.88-04	2016-06-17 18:10:41.88-04
1126	doug	and `code samples`	2016-06-17 18:10:58.108-04	2016-06-17 18:10:58.108-04
1127	doug	which let me show you bold and italic: `this is *italic* and **bold**`	2016-06-17 18:11:18.107-04	2016-06-17 18:11:18.107-04
1128	doug	code samples use backticks, can use multiple if code contains backticks ``like this: ` backtick``	2016-06-17 18:12:14.567-04	2016-06-17 18:12:14.567-04
1129	doug	```  ``like this`` ```	2016-06-17 18:12:33.723-04	2016-06-17 18:12:33.723-04
1130	doug	links are autodetected or you can use markdown `[like this](http://test.com/)`	2016-06-17 18:13:24.152-04	2016-06-17 18:13:24.152-04
1131	doug	[like this](http://test.com/)	2016-06-17 18:13:36.089-04	2016-06-17 18:13:36.089-04
1132	Marshall	Pretty sweet	2016-06-17 18:16:37.345-04	2016-06-17 18:16:37.345-04
1133	doug	plan is, each client has their own private chat room, plus a public chat	2016-06-17 18:17:48.351-04	2016-06-17 18:17:48.351-04
1134	doug	and a thing to view billing history	2016-06-17 18:18:20.018-04	2016-06-17 18:18:20.018-04
1135	doug	and a thing for me to record my time	2016-06-17 18:18:37.638-04	2016-06-17 18:18:37.638-04
1136	Marshall	ah gotcha	2016-06-17 18:18:44.38-04	2016-06-17 18:18:44.38-04
1137	doug	it's just jquery + my code	2016-06-17 18:20:59.426-04	2016-06-17 18:20:59.426-04
1138	doug	no plugins	2016-06-17 18:21:02.074-04	2016-06-17 18:21:02.074-04
1139	doug	@Marshall oh, source is [on github](https://github.com/doug65536/doug16k-site) by the way	2016-06-17 18:24:21.891-04	2016-06-17 18:24:21.891-04
1140	doug	nodejs backend	2016-06-17 18:25:18.988-04	2016-06-17 18:25:18.988-04
1141	doug	node/express/sequelize/postgres to be exact	2016-06-17 18:25:55.835-04	2016-06-17 18:25:55.835-04
1142	doug	frontend is as responsive as possible	2016-06-17 18:40:46.792-04	2016-06-17 18:40:46.792-04
1143	Marshall	Animation test	2016-06-17 18:59:25.669-04	2016-06-17 18:59:25.669-04
1144	doug	pushed changes to github	2016-06-18 00:45:28.138-04	2016-06-18 00:45:28.138-04
1145	doug	try new font picker!	2016-06-18 04:04:54.332-04	2016-06-18 04:04:54.332-04
1146	doug	at the right, in settings	2016-06-18 12:23:41.224-04	2016-06-18 12:23:41.224-04
\.


--
-- Name: chatmsgs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chatuser
--

SELECT pg_catalog.setval('chatmsgs_id_seq', 1146, true);


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: chatuser
--

COPY sessions (id, expires, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chatuser
--

SELECT pg_catalog.setval('sessions_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: chatuser
--

COPY users (id, username, salt, password, email, verified, verifytoken, "createdAt", "updatedAt", "sessionId") FROM stdin;
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: chatuser
--

SELECT pg_catalog.setval('users_id_seq', 1, false);


--
-- Name: chatmsgs_pkey; Type: CONSTRAINT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY chatmsgs
    ADD CONSTRAINT chatmsgs_pkey PRIMARY KEY (id);


--
-- Name: sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_username_key; Type: CONSTRAINT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: chatuser
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "users_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

