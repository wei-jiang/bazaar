/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *	Jacob O. Wobbrock, Ph.D.
 * 	The Information School
 *	University of Washington
 *	Seattle, WA 98195-2840
 *	wobbrock@uw.edu
 *
 *	Andrew D. Wilson, Ph.D.
 *	Microsoft Research
 *	One Microsoft Way
 *	Redmond, WA 98052
 *	awilson@microsoft.com
 *
 *	Yang Li, Ph.D.
 *	Department of Computer Science and Engineering
 * 	University of Washington
 *	Seattle, WA 98195-2840
 * 	yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be 
 * used to cite it, is:
 *
 *	Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without 
 *	  libraries, toolkits or training: A $1 recognizer for user interface 
 *	  prototypes. Proceedings of the ACM Symposium on User Interface 
 *	  Software and Technology (UIST '07). Newport, Rhode Island (October 
 *	  7-10, 2007). New York: ACM Press, pp. 159-168.
 *
 * The Protractor enhancement was separately published by Yang Li and programmed 
 * here by Jacob O. Wobbrock:
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture
 *	  recognizer. Proceedings of the ACM Conference on Human
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points, comments) // constructor
{	
	this.Name = name;
	this.Comments = comments || '';
	this.Points = Resample(points, NumPoints);
	this.points = CloneObj(this.Points);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);	
	this.Points = TranslateTo(this.Points, Origin);	
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score) // constructor
{
	this.Name = name;
	this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumUnistrokes = 16;
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0,0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	this.Unistrokes = [];
	// this.Unistrokes[0] = new Unistroke("三角形", new Array(new Point(137,139),new Point(135,141),new Point(133,144),new Point(132,146),new Point(130,149),new Point(128,151),new Point(126,155),new Point(123,160),new Point(120,166),new Point(116,171),new Point(112,177),new Point(107,183),new Point(102,188),new Point(100,191),new Point(95,195),new Point(90,199),new Point(86,203),new Point(82,206),new Point(80,209),new Point(75,213),new Point(73,213),new Point(70,216),new Point(67,219),new Point(64,221),new Point(61,223),new Point(60,225),new Point(62,226),new Point(65,225),new Point(67,226),new Point(74,226),new Point(77,227),new Point(85,229),new Point(91,230),new Point(99,231),new Point(108,232),new Point(116,233),new Point(125,233),new Point(134,234),new Point(145,233),new Point(153,232),new Point(160,233),new Point(170,234),new Point(177,235),new Point(179,236),new Point(186,237),new Point(193,238),new Point(198,239),new Point(200,237),new Point(202,239),new Point(204,238),new Point(206,234),new Point(205,230),new Point(202,222),new Point(197,216),new Point(192,207),new Point(186,198),new Point(179,189),new Point(174,183),new Point(170,178),new Point(164,171),new Point(161,168),new Point(154,160),new Point(148,155),new Point(143,150),new Point(138,148),new Point(136,148)));
	// this.Unistrokes[1] = new Unistroke("x", new Array(new Point(87,142),new Point(89,145),new Point(91,148),new Point(93,151),new Point(96,155),new Point(98,157),new Point(100,160),new Point(102,162),new Point(106,167),new Point(108,169),new Point(110,171),new Point(115,177),new Point(119,183),new Point(123,189),new Point(127,193),new Point(129,196),new Point(133,200),new Point(137,206),new Point(140,209),new Point(143,212),new Point(146,215),new Point(151,220),new Point(153,222),new Point(155,223),new Point(157,225),new Point(158,223),new Point(157,218),new Point(155,211),new Point(154,208),new Point(152,200),new Point(150,189),new Point(148,179),new Point(147,170),new Point(147,158),new Point(147,148),new Point(147,141),new Point(147,136),new Point(144,135),new Point(142,137),new Point(140,139),new Point(135,145),new Point(131,152),new Point(124,163),new Point(116,177),new Point(108,191),new Point(100,206),new Point(94,217),new Point(91,222),new Point(89,225),new Point(87,226),new Point(87,224)));
	// this.Unistrokes[2] = new Unistroke("rectangle", new Array(new Point(78,149),new Point(78,153),new Point(78,157),new Point(78,160),new Point(79,162),new Point(79,164),new Point(79,167),new Point(79,169),new Point(79,173),new Point(79,178),new Point(79,183),new Point(80,189),new Point(80,193),new Point(80,198),new Point(80,202),new Point(81,208),new Point(81,210),new Point(81,216),new Point(82,222),new Point(82,224),new Point(82,227),new Point(83,229),new Point(83,231),new Point(85,230),new Point(88,232),new Point(90,233),new Point(92,232),new Point(94,233),new Point(99,232),new Point(102,233),new Point(106,233),new Point(109,234),new Point(117,235),new Point(123,236),new Point(126,236),new Point(135,237),new Point(142,238),new Point(145,238),new Point(152,238),new Point(154,239),new Point(165,238),new Point(174,237),new Point(179,236),new Point(186,235),new Point(191,235),new Point(195,233),new Point(197,233),new Point(200,233),new Point(201,235),new Point(201,233),new Point(199,231),new Point(198,226),new Point(198,220),new Point(196,207),new Point(195,195),new Point(195,181),new Point(195,173),new Point(195,163),new Point(194,155),new Point(192,145),new Point(192,143),new Point(192,138),new Point(191,135),new Point(191,133),new Point(191,130),new Point(190,128),new Point(188,129),new Point(186,129),new Point(181,132),new Point(173,131),new Point(162,131),new Point(151,132),new Point(149,132),new Point(138,132),new Point(136,132),new Point(122,131),new Point(120,131),new Point(109,130),new Point(107,130),new Point(90,132),new Point(81,133),new Point(76,133)));
	// this.Unistrokes[3] = new Unistroke("circle", new Array(new Point(127,141),new Point(124,140),new Point(120,139),new Point(118,139),new Point(116,139),new Point(111,140),new Point(109,141),new Point(104,144),new Point(100,147),new Point(96,152),new Point(93,157),new Point(90,163),new Point(87,169),new Point(85,175),new Point(83,181),new Point(82,190),new Point(82,195),new Point(83,200),new Point(84,205),new Point(88,213),new Point(91,216),new Point(96,219),new Point(103,222),new Point(108,224),new Point(111,224),new Point(120,224),new Point(133,223),new Point(142,222),new Point(152,218),new Point(160,214),new Point(167,210),new Point(173,204),new Point(178,198),new Point(179,196),new Point(182,188),new Point(182,177),new Point(178,167),new Point(170,150),new Point(163,138),new Point(152,130),new Point(143,129),new Point(140,131),new Point(129,136),new Point(126,139)));
	// this.Unistrokes[4] = new Unistroke("check", new Array(new Point(91,185),new Point(93,185),new Point(95,185),new Point(97,185),new Point(100,188),new Point(102,189),new Point(104,190),new Point(106,193),new Point(108,195),new Point(110,198),new Point(112,201),new Point(114,204),new Point(115,207),new Point(117,210),new Point(118,212),new Point(120,214),new Point(121,217),new Point(122,219),new Point(123,222),new Point(124,224),new Point(126,226),new Point(127,229),new Point(129,231),new Point(130,233),new Point(129,231),new Point(129,228),new Point(129,226),new Point(129,224),new Point(129,221),new Point(129,218),new Point(129,212),new Point(129,208),new Point(130,198),new Point(132,189),new Point(134,182),new Point(137,173),new Point(143,164),new Point(147,157),new Point(151,151),new Point(155,144),new Point(161,137),new Point(165,131),new Point(171,122),new Point(174,118),new Point(176,114),new Point(177,112),new Point(177,114),new Point(175,116),new Point(173,118)));
	// this.Unistrokes[5] = new Unistroke("caret", new Array(new Point(79,245),new Point(79,242),new Point(79,239),new Point(80,237),new Point(80,234),new Point(81,232),new Point(82,230),new Point(84,224),new Point(86,220),new Point(86,218),new Point(87,216),new Point(88,213),new Point(90,207),new Point(91,202),new Point(92,200),new Point(93,194),new Point(94,192),new Point(96,189),new Point(97,186),new Point(100,179),new Point(102,173),new Point(105,165),new Point(107,160),new Point(109,158),new Point(112,151),new Point(115,144),new Point(117,139),new Point(119,136),new Point(119,134),new Point(120,132),new Point(121,129),new Point(122,127),new Point(124,125),new Point(126,124),new Point(129,125),new Point(131,127),new Point(132,130),new Point(136,139),new Point(141,154),new Point(145,166),new Point(151,182),new Point(156,193),new Point(157,196),new Point(161,209),new Point(162,211),new Point(167,223),new Point(169,229),new Point(170,231),new Point(173,237),new Point(176,242),new Point(177,244),new Point(179,250),new Point(181,255),new Point(182,257)));
	// this.Unistrokes[6] = new Unistroke("zig-zag", new Array(new Point(307,216),new Point(333,186),new Point(356,215),new Point(375,186),new Point(399,216),new Point(418,186)));
	// this.Unistrokes[7] = new Unistroke("arrow", new Array(new Point(68,222),new Point(70,220),new Point(73,218),new Point(75,217),new Point(77,215),new Point(80,213),new Point(82,212),new Point(84,210),new Point(87,209),new Point(89,208),new Point(92,206),new Point(95,204),new Point(101,201),new Point(106,198),new Point(112,194),new Point(118,191),new Point(124,187),new Point(127,186),new Point(132,183),new Point(138,181),new Point(141,180),new Point(146,178),new Point(154,173),new Point(159,171),new Point(161,170),new Point(166,167),new Point(168,167),new Point(171,166),new Point(174,164),new Point(177,162),new Point(180,160),new Point(182,158),new Point(183,156),new Point(181,154),new Point(178,153),new Point(171,153),new Point(164,153),new Point(160,153),new Point(150,154),new Point(147,155),new Point(141,157),new Point(137,158),new Point(135,158),new Point(137,158),new Point(140,157),new Point(143,156),new Point(151,154),new Point(160,152),new Point(170,149),new Point(179,147),new Point(185,145),new Point(192,144),new Point(196,144),new Point(198,144),new Point(200,144),new Point(201,147),new Point(199,149),new Point(194,157),new Point(191,160),new Point(186,167),new Point(180,176),new Point(177,179),new Point(171,187),new Point(169,189),new Point(165,194),new Point(164,196)));
	// this.Unistrokes[8] = new Unistroke("left square bracket", new Array(new Point(140,124),new Point(138,123),new Point(135,122),new Point(133,123),new Point(130,123),new Point(128,124),new Point(125,125),new Point(122,124),new Point(120,124),new Point(118,124),new Point(116,125),new Point(113,125),new Point(111,125),new Point(108,124),new Point(106,125),new Point(104,125),new Point(102,124),new Point(100,123),new Point(98,123),new Point(95,124),new Point(93,123),new Point(90,124),new Point(88,124),new Point(85,125),new Point(83,126),new Point(81,127),new Point(81,129),new Point(82,131),new Point(82,134),new Point(83,138),new Point(84,141),new Point(84,144),new Point(85,148),new Point(85,151),new Point(86,156),new Point(86,160),new Point(86,164),new Point(86,168),new Point(87,171),new Point(87,175),new Point(87,179),new Point(87,182),new Point(87,186),new Point(88,188),new Point(88,195),new Point(88,198),new Point(88,201),new Point(88,207),new Point(89,211),new Point(89,213),new Point(89,217),new Point(89,222),new Point(88,225),new Point(88,229),new Point(88,231),new Point(88,233),new Point(88,235),new Point(89,237),new Point(89,240),new Point(89,242),new Point(91,241),new Point(94,241),new Point(96,240),new Point(98,239),new Point(105,240),new Point(109,240),new Point(113,239),new Point(116,240),new Point(121,239),new Point(130,240),new Point(136,237),new Point(139,237),new Point(144,238),new Point(151,237),new Point(157,236),new Point(159,237)));
	// this.Unistrokes[9] = new Unistroke("right square bracket", new Array(new Point(112,138),new Point(112,136),new Point(115,136),new Point(118,137),new Point(120,136),new Point(123,136),new Point(125,136),new Point(128,136),new Point(131,136),new Point(134,135),new Point(137,135),new Point(140,134),new Point(143,133),new Point(145,132),new Point(147,132),new Point(149,132),new Point(152,132),new Point(153,134),new Point(154,137),new Point(155,141),new Point(156,144),new Point(157,152),new Point(158,161),new Point(160,170),new Point(162,182),new Point(164,192),new Point(166,200),new Point(167,209),new Point(168,214),new Point(168,216),new Point(169,221),new Point(169,223),new Point(169,228),new Point(169,231),new Point(166,233),new Point(164,234),new Point(161,235),new Point(155,236),new Point(147,235),new Point(140,233),new Point(131,233),new Point(124,233),new Point(117,235),new Point(114,238),new Point(112,238)));
	// this.Unistrokes[10] = new Unistroke("v", new Array(new Point(89,164),new Point(90,162),new Point(92,162),new Point(94,164),new Point(95,166),new Point(96,169),new Point(97,171),new Point(99,175),new Point(101,178),new Point(103,182),new Point(106,189),new Point(108,194),new Point(111,199),new Point(114,204),new Point(117,209),new Point(119,214),new Point(122,218),new Point(124,222),new Point(126,225),new Point(128,228),new Point(130,229),new Point(133,233),new Point(134,236),new Point(136,239),new Point(138,240),new Point(139,242),new Point(140,244),new Point(142,242),new Point(142,240),new Point(142,237),new Point(143,235),new Point(143,233),new Point(145,229),new Point(146,226),new Point(148,217),new Point(149,208),new Point(149,205),new Point(151,196),new Point(151,193),new Point(153,182),new Point(155,172),new Point(157,165),new Point(159,160),new Point(162,155),new Point(164,150),new Point(165,148),new Point(166,146)));
	// this.Unistrokes[11] = new Unistroke("delete", new Array(new Point(123,129),new Point(123,131),new Point(124,133),new Point(125,136),new Point(127,140),new Point(129,142),new Point(133,148),new Point(137,154),new Point(143,158),new Point(145,161),new Point(148,164),new Point(153,170),new Point(158,176),new Point(160,178),new Point(164,183),new Point(168,188),new Point(171,191),new Point(175,196),new Point(178,200),new Point(180,202),new Point(181,205),new Point(184,208),new Point(186,210),new Point(187,213),new Point(188,215),new Point(186,212),new Point(183,211),new Point(177,208),new Point(169,206),new Point(162,205),new Point(154,207),new Point(145,209),new Point(137,210),new Point(129,214),new Point(122,217),new Point(118,218),new Point(111,221),new Point(109,222),new Point(110,219),new Point(112,217),new Point(118,209),new Point(120,207),new Point(128,196),new Point(135,187),new Point(138,183),new Point(148,167),new Point(157,153),new Point(163,145),new Point(165,142),new Point(172,133),new Point(177,127),new Point(179,127),new Point(180,125)));
	// this.Unistrokes[12] = new Unistroke("left curly brace", new Array(new Point(150,116),new Point(147,117),new Point(145,116),new Point(142,116),new Point(139,117),new Point(136,117),new Point(133,118),new Point(129,121),new Point(126,122),new Point(123,123),new Point(120,125),new Point(118,127),new Point(115,128),new Point(113,129),new Point(112,131),new Point(113,134),new Point(115,134),new Point(117,135),new Point(120,135),new Point(123,137),new Point(126,138),new Point(129,140),new Point(135,143),new Point(137,144),new Point(139,147),new Point(141,149),new Point(140,152),new Point(139,155),new Point(134,159),new Point(131,161),new Point(124,166),new Point(121,166),new Point(117,166),new Point(114,167),new Point(112,166),new Point(114,164),new Point(116,163),new Point(118,163),new Point(120,162),new Point(122,163),new Point(125,164),new Point(127,165),new Point(129,166),new Point(130,168),new Point(129,171),new Point(127,175),new Point(125,179),new Point(123,184),new Point(121,190),new Point(120,194),new Point(119,199),new Point(120,202),new Point(123,207),new Point(127,211),new Point(133,215),new Point(142,219),new Point(148,220),new Point(151,221)));
	// this.Unistrokes[13] = new Unistroke("right curly brace", new Array(new Point(117,132),new Point(115,132),new Point(115,129),new Point(117,129),new Point(119,128),new Point(122,127),new Point(125,127),new Point(127,127),new Point(130,127),new Point(133,129),new Point(136,129),new Point(138,130),new Point(140,131),new Point(143,134),new Point(144,136),new Point(145,139),new Point(145,142),new Point(145,145),new Point(145,147),new Point(145,149),new Point(144,152),new Point(142,157),new Point(141,160),new Point(139,163),new Point(137,166),new Point(135,167),new Point(133,169),new Point(131,172),new Point(128,173),new Point(126,176),new Point(125,178),new Point(125,180),new Point(125,182),new Point(126,184),new Point(128,187),new Point(130,187),new Point(132,188),new Point(135,189),new Point(140,189),new Point(145,189),new Point(150,187),new Point(155,186),new Point(157,185),new Point(159,184),new Point(156,185),new Point(154,185),new Point(149,185),new Point(145,187),new Point(141,188),new Point(136,191),new Point(134,191),new Point(131,192),new Point(129,193),new Point(129,195),new Point(129,197),new Point(131,200),new Point(133,202),new Point(136,206),new Point(139,211),new Point(142,215),new Point(145,220),new Point(147,225),new Point(148,231),new Point(147,239),new Point(144,244),new Point(139,248),new Point(134,250),new Point(126,253),new Point(119,253),new Point(115,253)));
	// this.Unistrokes[14] = new Unistroke("star", new Array(new Point(75,250),new Point(75,247),new Point(77,244),new Point(78,242),new Point(79,239),new Point(80,237),new Point(82,234),new Point(82,232),new Point(84,229),new Point(85,225),new Point(87,222),new Point(88,219),new Point(89,216),new Point(91,212),new Point(92,208),new Point(94,204),new Point(95,201),new Point(96,196),new Point(97,194),new Point(98,191),new Point(100,185),new Point(102,178),new Point(104,173),new Point(104,171),new Point(105,164),new Point(106,158),new Point(107,156),new Point(107,152),new Point(108,145),new Point(109,141),new Point(110,139),new Point(112,133),new Point(113,131),new Point(116,127),new Point(117,125),new Point(119,122),new Point(121,121),new Point(123,120),new Point(125,122),new Point(125,125),new Point(127,130),new Point(128,133),new Point(131,143),new Point(136,153),new Point(140,163),new Point(144,172),new Point(145,175),new Point(151,189),new Point(156,201),new Point(161,213),new Point(166,225),new Point(169,233),new Point(171,236),new Point(174,243),new Point(177,247),new Point(178,249),new Point(179,251),new Point(180,253),new Point(180,255),new Point(179,257),new Point(177,257),new Point(174,255),new Point(169,250),new Point(164,247),new Point(160,245),new Point(149,238),new Point(138,230),new Point(127,221),new Point(124,220),new Point(112,212),new Point(110,210),new Point(96,201),new Point(84,195),new Point(74,190),new Point(64,182),new Point(55,175),new Point(51,172),new Point(49,170),new Point(51,169),new Point(56,169),new Point(66,169),new Point(78,168),new Point(92,166),new Point(107,164),new Point(123,161),new Point(140,162),new Point(156,162),new Point(171,160),new Point(173,160),new Point(186,160),new Point(195,160),new Point(198,161),new Point(203,163),new Point(208,163),new Point(206,164),new Point(200,167),new Point(187,172),new Point(174,179),new Point(172,181),new Point(153,192),new Point(137,201),new Point(123,211),new Point(112,220),new Point(99,229),new Point(90,237),new Point(80,244),new Point(73,250),new Point(69,254),new Point(69,252)));
	// this.Unistrokes[15] = new Unistroke("pigtail", new Array(new Point(81,219),new Point(84,218),new Point(86,220),new Point(88,220),new Point(90,220),new Point(92,219),new Point(95,220),new Point(97,219),new Point(99,220),new Point(102,218),new Point(105,217),new Point(107,216),new Point(110,216),new Point(113,214),new Point(116,212),new Point(118,210),new Point(121,208),new Point(124,205),new Point(126,202),new Point(129,199),new Point(132,196),new Point(136,191),new Point(139,187),new Point(142,182),new Point(144,179),new Point(146,174),new Point(148,170),new Point(149,168),new Point(151,162),new Point(152,160),new Point(152,157),new Point(152,155),new Point(152,151),new Point(152,149),new Point(152,146),new Point(149,142),new Point(148,139),new Point(145,137),new Point(141,135),new Point(139,135),new Point(134,136),new Point(130,140),new Point(128,142),new Point(126,145),new Point(122,150),new Point(119,158),new Point(117,163),new Point(115,170),new Point(114,175),new Point(117,184),new Point(120,190),new Point(125,199),new Point(129,203),new Point(133,208),new Point(138,213),new Point(145,215),new Point(155,218),new Point(164,219),new Point(166,219),new Point(177,219),new Point(182,218),new Point(192,216),new Point(196,213),new Point(199,212),new Point(201,211)));
	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function(points, useProtractor)
	{
		points = Resample(points, NumPoints);
		var radians = IndicativeAngle(points);
		points = RotateBy(points, -radians);
		points = ScaleTo(points, SquareSize);
		points = TranslateTo(points, Origin);
		var vector = Vectorize(points); // for Protractor

		var b = +Infinity;
		var u = -1;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke
		{
			var d;
			if (useProtractor) // for Protractor
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, vector);
			else // Golden Section Search (original $1)
				d = DistanceAtBestAngle(points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke
			}
		}
		return (u == -1) ? new Result("No match.", 0.0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
	};
	this.Clear = function()
	{
		this.Unistrokes.length = 0;
	}
	this.DeleteByName = function(name)
	{
		this.Unistrokes = this.Unistrokes.filter( s => s.Name != name );
	}
	this.StringifyGestures = function()
	{
		var gestures = [];
		for (var i = 0; i < this.Unistrokes.length; i++) 
		{
			gestures.push({
				name : this.Unistrokes[i].Name,
				points : this.Unistrokes[i].points,
				comments : this.Unistrokes[i].Comments
			});
		}
		return JSON.stringify(gestures);
	}
	this.ParseInGestures = function( gesStr )
	{
		try{
			var gestures = JSON.parse(gesStr);
			for (var i = 0; i < gestures.length; i++) 
			{
				this.Unistrokes.push( new Unistroke( gestures[i].name, gestures[i].points, gestures[i].comments) );
			}
		} catch(err) {
			console.log('ParseInGestures failed', err)
		}
		
	}
	this.GetUnistroke = function(name)
	{	
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				return this.Unistrokes[i];
		}
	}
	this.GetUnistrokes = function()
	{	
		return this.Unistrokes;
	}
	this.UpdateGesture = function(name, points, comments)
	{		
		var i = 0;
		for (; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name){
				this.Unistrokes[i] = new Unistroke(name, points, comments);
				return 'updated';
			}				
		}
		if( i == this.Unistrokes.length ) {
			this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points, comments); // append new unistroke
			return 'added';
		}
	}
	this.AddGesture = function(name, points)
	{
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function()
	{
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
	this.GetGesturePoints = function(name, scale, origin)
	{
		// var SquareSize = 250.0;
		// var Origin = new Point(0,0);
		var points = [];
		this.Unistrokes.forEach(function(g){
			if(g.Name == name) {
				points = g.points;
			}
		});
		if(scale) {
			points = ScaleTo(points, scale);
		}			
		if(origin) {
			points = TranslateTo(points, origin);	
		}	
		return points;
	}
}
//
// Private helper functions from this point down
//
function Resample(points, n)
{
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++)
	{
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I)
		{
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points)
{
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold)
{
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold)
	{
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians)
{
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points)
{
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points)
{
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2)
{
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points)
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2)
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }
function CloneObj(obj) {
	return JSON.parse( JSON.stringify(obj) );
}
let dr = new DollarRecognizer();
let default_gestures = '[{"name":"帮助","points":[{"X":183,"Y":88.28125},{"X":183,"Y":98.15830430324115},{"X":182.5924530997361,"Y":108.02464110501388},{"X":182.07332665086759,"Y":117.88804363351588},{"X":181.32360743431622,"Y":127.73615707104743},{"X":180.53595954340406,"Y":137.5817557074492},{"X":179.74831165249194,"Y":147.42735434385094},{"X":178.96066376157978,"Y":157.27295298025268},{"X":178.17301587066763,"Y":167.11855161665443},{"X":177.3853679797555,"Y":176.96415025305618},{"X":176.59772008884335,"Y":186.80974888945792},{"X":175.716233910556,"Y":196.6459674120333},{"X":174.53943009653614,"Y":206.452665862199},{"X":173.36262628251623,"Y":216.25936431236474},{"X":172.24536740262755,"Y":226.07294337635207},{"X":171.1546292227965,"Y":235.88958699483152},{"X":170.06389104296545,"Y":245.70623061331096},{"X":168.84666347906403,"Y":255.50794216748778},{"X":167.6215656700383,"Y":265.3087246396935},{"X":165.9216290167687,"Y":275.0260823262177},{"X":163.73266534187624,"Y":284.65752249574456},{"X":161.41904439069373,"Y":294.25649907164143},{"X":158.6320722860832,"Y":303.732204227317},{"X":155.92306693477082,"Y":313.23000457250697},{"X":153.04616644835684,"Y":322.6658338791079},{"X":150,"Y":323.4571530443067},{"X":150,"Y":313.58009874106557},{"X":150,"Y":303.7030444378244},{"X":150,"Y":293.82599013458326},{"X":150.36601485112735,"Y":284.00019802105425},{"X":153.07945034961742,"Y":274.50317377633905},{"X":156.0637665941806,"Y":265.0899502174581},{"X":159.2253540060971,"Y":255.7339616994785},{"X":162.98604050854226,"Y":246.60086590782595},{"X":166.843186294462,"Y":237.5105587816298},{"X":171.08966361478411,"Y":228.59295640895337},{"X":175.33614093510622,"Y":219.67535403627693},{"X":180.28727126653598,"Y":211.1357978891067},{"X":185.42181093484123,"Y":202.70125996459328},{"X":191.2312147324072,"Y":194.71332974294006},{"X":197.5640428610072,"Y":187.14670178136686},{"X":204.915007930711,"Y":180.67124471285933},{"X":213.26950362825716,"Y":175.41296221242447},{"X":222.1292437815049,"Y":171.08300266506933},{"X":231.84173217517792,"Y":170.28125},{"X":234.51344603898872,"Y":177.98294058483083},{"X":235,"Y":187.84379440328732},{"X":235,"Y":197.72084870652847},{"X":235,"Y":207.59790300976962},{"X":235,"Y":217.47495731301078},{"X":235,"Y":227.35201161625193},{"X":235,"Y":237.22906591949308},{"X":235,"Y":247.10612022273423},{"X":235,"Y":256.98317452597536},{"X":235,"Y":266.8602288292165},{"X":235,"Y":276.73728313245766},{"X":235,"Y":286.6143374356988},{"X":235,"Y":296.49139173893997},{"X":235.50551411628672,"Y":306.3474193954406},{"X":238.07900339831124,"Y":315.60765543729804},{"X":245.32185115145143,"Y":320.8986573073502},{"X":251.72891154141257,"Y":315.1551810391079},{"X":256.8644557707063,"Y":306.71821551955395},{"X":262,"Y":298.28125}],"comments":"打开帮助界面"},{"name":"移动","points":[{"X":137,"Y":285.28125},{"X":139.6557026565992,"Y":283.06816445283397},{"X":142.31140531319843,"Y":280.855078905668},{"X":144.81061814051677,"Y":278.47063185948326},{"X":147.25505102355353,"Y":276.02619897644644},{"X":149.69948390659036,"Y":273.58176609340967},{"X":152.14391678962713,"Y":271.13733321037284},{"X":154.60701295288348,"Y":268.71217535667176},{"X":157.12898668958883,"Y":266.34782497851046},{"X":159.6509604262942,"Y":263.98347460034915},{"X":162.17293416299958,"Y":261.61912422218785},{"X":164.69490789970496,"Y":259.25477384402654},{"X":167.21688163641033,"Y":256.89042346586524},{"X":169.73885537311574,"Y":254.526073087704},{"X":172.25300709707443,"Y":252.15340996387414},{"X":174.76625531329282,"Y":249.77978664855678},{"X":177.2795035295112,"Y":247.40616333323942},{"X":179.7927517457296,"Y":245.03254001792206},{"X":182.30599996194798,"Y":242.6589167026047},{"X":184.81924817816636,"Y":240.28529338728734},{"X":187.33249639438475,"Y":237.91167007196995},{"X":189.90155620118878,"Y":235.59910412971763},{"X":192.49079996938,"Y":233.30861925785618},{"X":195.0800437375712,"Y":231.01813438599473},{"X":197.6692875057624,"Y":228.72764951413328},{"X":200.25853127395362,"Y":226.43716464227182},{"X":202.84777504214483,"Y":224.14667977041037},{"X":205.43701881033604,"Y":221.85619489854892},{"X":208.02626257852725,"Y":219.56571002668747},{"X":210.61550634671846,"Y":217.27522515482602},{"X":213.20475011490964,"Y":214.98474028296454},{"X":215.75750093761673,"Y":212.65393431702154},{"X":218.29407499908945,"Y":210.30525463047275},{"X":220.83064906056214,"Y":207.95657494392393},{"X":223.36722312203486,"Y":205.60789525737513},{"X":225.90379718350755,"Y":203.2592155708263},{"X":228.44037124498027,"Y":200.91053588427752},{"X":230.976945306453,"Y":198.56185619772873},{"X":233.51351936792568,"Y":196.2131765111799},{"X":236.0500934293984,"Y":193.86449682463112},{"X":238.58666749087112,"Y":191.51581713808233},{"X":241.13115377760113,"Y":189.1763269779191},{"X":243.83057831421402,"Y":187.01678734862878},{"X":246.53000285082692,"Y":184.85724771933846},{"X":249.2294273874398,"Y":182.69770809004814},{"X":251.9288519240527,"Y":180.53816846075782},{"X":254.6282764606656,"Y":178.3786288314675},{"X":257.3277009972785,"Y":176.21908920217717},{"X":260.0271255338914,"Y":174.05954957288685},{"X":262.72655007050435,"Y":171.90000994359653},{"X":265.42597460711727,"Y":169.7404703143062},{"X":268.1253991437302,"Y":167.5809306850159},{"X":270.82482368034306,"Y":165.42139105572554},{"X":273.5654238179713,"Y":163.3144250728887},{"X":276.30888143617415,"Y":161.21110756559983},{"X":279.052339054377,"Y":159.10779005831097},{"X":281.79579667257985,"Y":157.0044725510221},{"X":284.5392542907827,"Y":154.90115504373324},{"X":287.28271190898556,"Y":152.79783753644438},{"X":290.0261695271884,"Y":150.6945200291555},{"X":292.76962714539127,"Y":148.59120252186665},{"X":295.5130847635941,"Y":146.48788501457778},{"X":298.256542381797,"Y":144.38456750728892},{"X":300.9999999999999,"Y":142.2812500000001}],"comments":"根据手势方向移动角色"},{"name":"聊天","points":[{"X":237,"Y":146.28125},{"X":230.91310989426063,"Y":146.28125},{"X":224.82621978852126,"Y":146.28125},{"X":218.7393296827819,"Y":146.28125},{"X":212.9868673018854,"Y":147.95338862421443},{"X":207.36819951197214,"Y":150.29450020334494},{"X":202.00102096273275,"Y":153.12677556139525},{"X":196.81707038131321,"Y":156.31689899611493},{"X":191.67114591891928,"Y":159.55951114552985},{"X":187.02449749164887,"Y":163.4912905839894},{"X":182.37784906437847,"Y":167.42307002244897},{"X":177.82474095924812,"Y":171.45650904075188},{"X":173.52065968914252,"Y":175.76059031085748},{"X":169.21657841903692,"Y":180.06467158096308},{"X":165.07722323133956,"Y":184.51161902488062},{"X":161.42508916789595,"Y":189.3811311094721},{"X":157.7729551044523,"Y":194.2506431940636},{"X":154.1208210410087,"Y":199.1201552786551},{"X":150.802682811648,"Y":204.22255838199857},{"X":147.4959719817022,"Y":209.33292966464202},{"X":144.18926115175643,"Y":214.4433009472855},{"X":141.5872804171824,"Y":219.91395749867385},{"X":139.38110985629612,"Y":225.58696751238145},{"X":137.17493929540984,"Y":231.25997752608902},{"X":135.27591625242553,"Y":237.03276824078293},{"X":133.7268435070633,"Y":242.91924467315943},{"X":132.17777076170108,"Y":248.8057211055359},{"X":131,"Y":254.7402353041795},{"X":131,"Y":260.82712540991884},{"X":131,"Y":266.9140155156582},{"X":131,"Y":273.0009056213976},{"X":131,"Y":279.08779572713695},{"X":131,"Y":285.1746858328763},{"X":132.57491734560415,"Y":291.00600203681245},{"X":134.4997610057321,"Y":296.7805330171963},{"X":137.81424838399016,"Y":301.7990604799877},{"X":141.61669848805357,"Y":306.55212311006693},{"X":146.18396166361688,"Y":310.48553115173473},{"X":151.18855517994956,"Y":313.95024973996505},{"X":156.22123321567335,"Y":317.36026186274046},{"X":161.95351273952005,"Y":319.40750454982856},{"X":167.68579226336675,"Y":321.45474723691666},{"X":173.55903788649454,"Y":322.99305757729894},{"X":179.5277246992368,"Y":324.1867949398474},{"X":185.5062423972707,"Y":325.28125},{"X":191.59313250301008,"Y":325.28125},{"X":197.68002260874945,"Y":325.28125},{"X":203.76558930933626,"Y":325.23621533474494},{"X":209.8419757142283,"Y":324.8787808403395},{"X":215.91836211912036,"Y":324.5213463459341},{"X":221.83066253193192,"Y":323.4803351422798},{"X":227.4072115490486,"Y":321.04059494729125},{"X":232.9837605661653,"Y":318.6008547523027},{"X":238.4264077279231,"Y":315.89473129832965},{"X":243.71130831909656,"Y":312.8747881033734},{"X":248.99620891026996,"Y":309.85484490841714},{"X":253.27582701761492,"Y":305.5959446051832},{"X":257.3197366947998,"Y":301.0465462183503},{"X":260.9427847021377,"Y":296.16135141700727},{"X":264.26392539557173,"Y":291.0693805577495},{"X":267.2124931943077,"Y":285.7500170142308},{"X":269,"Y":280.0073692655245},{"X":270.3789968209125,"Y":274.1442595372625},{"X":271.99999999999994,"Y":268.2812500000002}],"comments":"打开聊天界面"},{"name":"商品","points":[{"X":181,"Y":114.28125},{"X":181,"Y":124.43588142706133},{"X":181,"Y":134.59051285412266},{"X":181,"Y":144.745144281184},{"X":181,"Y":154.89977570824533},{"X":181,"Y":165.05440713530666},{"X":181,"Y":175.209038562368},{"X":181.00433189847038,"Y":185.36355607093753},{"X":181.5380474770685,"Y":195.5041520643012},{"X":182.06818408575072,"Y":205.64493171501448},{"X":182.5752821801617,"Y":215.78689360323446},{"X":183,"Y":225.93091371273343},{"X":183,"Y":236.08554513979476},{"X":183,"Y":246.2401765668561},{"X":183,"Y":256.3948079939174},{"X":183,"Y":266.54943942097873},{"X":182.00063629007508,"Y":276.61118978626615},{"X":180.12925414040737,"Y":286.5918945844939},{"X":177.21992909516905,"Y":296.3164804407007},{"X":173.56056016026812,"Y":305.7699896393967},{"X":168.61500339615296,"Y":314.5699974528853},{"X":160.01018541922238,"Y":317.2914354192224},{"X":158.18606103730414,"Y":307.3045857051727},{"X":156.79539131384584,"Y":297.2466848538439},{"X":155.75710198850516,"Y":287.15198380458787},{"X":155.16080149893617,"Y":277.0148754819151},{"X":155,"Y":266.86496942654304},{"X":155,"Y":256.7103379994817},{"X":155,"Y":246.55570657242035},{"X":155,"Y":236.40107514535902},{"X":155.7805369204824,"Y":226.29713360963478},{"X":157.09392866376743,"Y":216.22779691111623},{"X":158.76380340750228,"Y":206.22603636999088},{"X":161.22666328767818,"Y":196.37459684928723},{"X":163.6895231678541,"Y":186.52315732858358},{"X":166.6907816611512,"Y":176.824507636382},{"X":169.7697030481356,"Y":167.1478975630024},{"X":173.17049381028406,"Y":157.58370374800433},{"X":176.78549515173665,"Y":148.09432522669127},{"X":180.759351945546,"Y":138.762546108908},{"X":185.30064117701897,"Y":129.67996764596205},{"X":190.874559201865,"Y":121.24432303757548},{"X":197.08003305852424,"Y":113.20849267406886},{"X":204.59385178197275,"Y":106.37774838002476},{"X":212.96528343823215,"Y":100.79860828088393},{"X":222.41787822318344,"Y":97.29949928373702},{"X":232.46073415705132,"Y":96.28125},{"X":242.44482690183582,"Y":97.00366345091791},{"X":247,"Y":105.25455573583766},{"X":246.98190695290967,"Y":115.4079013296323},{"X":245.54582520440468,"Y":125.46047356916743},{"X":241.761216089509,"Y":134.6792231841517},{"X":236.53670132235496,"Y":143.38674779607507},{"X":230.30810883873747,"Y":151.39611395157814},{"X":223.96456087651174,"Y":159.32554890436032},{"X":217.23902999323715,"Y":166.90417150642472},{"X":209.87692796025766,"Y":173.89816843775523},{"X":202.51482592727817,"Y":180.89216536908575},{"X":194.65127735985178,"Y":187.29279198011113},{"X":186.52757221820272,"Y":193.38557083634797},{"X":178.40386707655367,"Y":199.47834969258477},{"X":170.01125378059402,"Y":205.18695405613434},{"X":161.505626890297,"Y":210.73410202806716},{"X":153.00000000000003,"Y":216.28124999999997}],"comments":"打开商品管理界面"},{"name":"订单","points":[{"X":229,"Y":133.28125},{"X":219.13001534551833,"Y":133.28125},{"X":209.98236406385539,"Y":136.06882552008034},{"X":201.44300491729663,"Y":141.01544704962203},{"X":193.3936316171867,"Y":146.65067580255752},{"X":186.09043444753272,"Y":153.28994595678844},{"X":179.5764717674953,"Y":160.6908742747783},{"X":173.29925849490408,"Y":168.3005103710486},{"X":167.7076277066872,"Y":176.4337915175459},{"X":162.27597044215722,"Y":184.66348824679073},{"X":157.69622852518665,"Y":193.4066319064618},{"X":153.11648660821612,"Y":202.14977556613286},{"X":149.37928493088233,"Y":211.26982351764707},{"X":145.96166799398821,"Y":220.52401937140803},{"X":144.42231978713613,"Y":230.27322468147125},{"X":142.9583773940537,"Y":240.03045690703334},{"X":142.4108891515956,"Y":249.8852452712791},{"X":142,"Y":259.7438251314324},{"X":142,"Y":269.61380978591404},{"X":143.12478523176028,"Y":279.330476834337},{"X":145.76642606019522,"Y":288.84038381670274},{"X":149.47575155627746,"Y":297.92328416802025},{"X":154.12045021721002,"Y":306.6320941572688},{"X":160.12207784517733,"Y":314.4277434142128},{"X":166.80034133497705,"Y":321.6315060012328},{"X":174.69632905856238,"Y":327.5534967939218},{"X":183.33457897686856,"Y":332.237386855872},{"X":192.29825602624325,"Y":336.3558140065608},{"X":201.87354761533817,"Y":338.7496369038345},{"X":211.54805903281388,"Y":340.5030036895509},{"X":221.39882266680584,"Y":341.1186764166754},{"X":231.2637318484941,"Y":341.28125},{"X":241.13371650297577,"Y":341.28125},{"X":251.00370115745744,"Y":341.28125},{"X":260.26801767255915,"Y":338.25290930310035},{"X":268.51003187308953,"Y":333.090311933555},{"X":275.81322904274356,"Y":326.45104177932404},{"X":280.7716514794359,"Y":317.9308599109872},{"X":285.1808422442909,"Y":309.13233734855766},{"X":288.6464252245971,"Y":299.89078273440776},{"X":290.98886023814305,"Y":290.3480885711416},{"X":292.6114757200593,"Y":280.6123956796444},{"X":293.41639589337865,"Y":270.78612391918404},{"X":293.96388413583674,"Y":260.93133555493824},{"X":294,"Y":251.06235334600953},{"X":294,"Y":241.19236869152786},{"X":294,"Y":231.3223840370462},{"X":293.6122706244373,"Y":221.46530936655955},{"X":292.82851548463844,"Y":211.638183067394},{"X":290.28538907757485,"Y":202.1014590409057},{"X":287.8161027270515,"Y":192.54566090820583},{"X":285.1449113722016,"Y":183.05801956772407},{"X":281.6017933681431,"Y":173.845912757172},{"X":277.07648565024175,"Y":165.0881403587765},{"X":271.60269645045196,"Y":156.91328829343817},{"X":265.39564141849536,"Y":149.24283165491127},{"X":257.8388800953392,"Y":143.2006900476696},{"X":248.5885584938694,"Y":139.92838962346735},{"X":238.79824036759666,"Y":139.28125},{"X":229.98001381161075,"Y":142.37354706799175},{"X":222.15682720237427,"Y":148.39138292125054},{"X":215.61573286514985,"Y":155.74237056182017},{"X":209.7262631815831,"Y":163.61643416709762},{"X":205,"Y":172.28125}],"comments":"打开订单界面"},{"name":"通知","points":[{"X":170,"Y":159.28125},{"X":169.5528456287656,"Y":167.85848496987532},{"X":168.62446769882962,"Y":176.41210531287413},{"X":167.89348267531588,"Y":184.98552719494577},{"X":167.35671291979668,"Y":193.5738432832529},{"X":166.8199431642775,"Y":202.16215937156002},{"X":166.2831734087583,"Y":210.75047545986715},{"X":165.76126804439193,"Y":219.33969324533712},{"X":165.25596071215665,"Y":227.92991789333698},{"X":165,"Y":236.52746993235698},{"X":165,"Y":245.13254372652722},{"X":164.9192152650493,"Y":253.73537522911246},{"X":164.44189165283342,"Y":262.3272002489983},{"X":164,"Y":270.9200087317179},{"X":164,"Y":279.52508252588814},{"X":163.91553066405376,"Y":288.1259433594624},{"X":163.05929381908368,"Y":296.6883118091631},{"X":161.5327755503011,"Y":305.1501477987956},{"X":160.3315609174575,"Y":304.93905458728756},{"X":159.0221507712729,"Y":296.43630539891035},{"X":159,"Y":287.8328058115856},{"X":159,"Y":279.2277320174154},{"X":159,"Y":270.6226582232452},{"X":159,"Y":262.017584429075},{"X":159,"Y":253.41251063490478},{"X":159,"Y":244.80743684073457},{"X":159.67130076310437,"Y":236.23954313206065},{"X":160.62157219418125,"Y":227.68710025236865},{"X":162.6375109405243,"Y":219.36871717842715},{"X":165.5086036501989,"Y":211.25830693280295},{"X":168.94876684066259,"Y":203.38371631867483},{"X":172.86556578387317,"Y":195.7232315890283},{"X":177.0533301665685,"Y":188.20658776680412},{"X":182.0500855437796,"Y":181.20111312995263},{"X":186.61076553333896,"Y":173.90402514665766},{"X":192.1828709285429,"Y":167.35796893880809},{"X":198.1334603261133,"Y":161.1477896738867},{"X":204.65818548215756,"Y":155.55470161427394},{"X":212.43079830641997,"Y":151.995090338716},{"X":220.89763125165848,"Y":150.4649781247236},{"X":229.48749924133963,"Y":150.28125},{"X":237.19613211315024,"Y":152.87609281753365},{"X":241.50378225189166,"Y":160.28881450378336},{"X":243.81792509296565,"Y":168.55295037186255},{"X":244,"Y":177.13560972069303},{"X":244,"Y":185.74068351486324},{"X":244.00494748475535,"Y":194.34556730181944},{"X":244.664926517413,"Y":202.92529472636897},{"X":245,"Y":211.5175000869686},{"X":245,"Y":220.1225738811388},{"X":245,"Y":228.72764767530902},{"X":245,"Y":237.33272146947922},{"X":245,"Y":245.93779526364943},{"X":245,"Y":254.54286905781964},{"X":245,"Y":263.14794285198985},{"X":245.49382401498605,"Y":271.7256661348745},{"X":246.66112317917427,"Y":280.2479890750456},{"X":249.96401493453837,"Y":287.9239266230256},{"X":258.03501865201895,"Y":290.28125},{"X":266.4765933192818,"Y":289.06036091292316},{"X":274.199676620406,"Y":285.881627276193},{"X":279.799784413604,"Y":279.34816818412867},{"X":285.399892206802,"Y":272.81470909206433},{"X":291,"Y":266.28125}],"comments":"打开系统通知界面"},{"name":"手势","points":[{"X":249,"Y":119.28125},{"X":240.18793932950604,"Y":111.43160146360484},{"X":228.7014909527261,"Y":109.28125},{"X":217.10850677326033,"Y":110.78632483899682},{"X":206.54896320508576,"Y":115.54374550299778},{"X":197.8641017986181,"Y":123.56054064742946},{"X":190.85103571500358,"Y":133.00469642749462},{"X":184.2948684003569,"Y":142.83894739946464},{"X":179.8078470956785,"Y":153.76163226080374},{"X":175.82702484736464,"Y":164.83802637371818},{"X":174.52180165349276,"Y":176.58503511856526},{"X":174,"Y":188.37543377364605},{"X":174,"Y":200.19473248538588},{"X":177.93791198810507,"Y":209.9065246587367},{"X":189.29461986405732,"Y":212.21071198640573},{"X":200.93118869049528,"Y":210.2937611471827},{"X":209.96929973072798,"Y":202.6918425355379},{"X":217.70468585263038,"Y":193.8926160325376},{"X":224.40065923914295,"Y":184.1530183794284},{"X":230.15311031819084,"Y":173.83388108331675},{"X":235.81280668945763,"Y":163.4577710693277},{"X":240.46880765541852,"Y":152.60923086145374},{"X":244.85838499800275,"Y":141.63528750499313},{"X":249.7931826771958,"Y":130.89602086607576},{"X":253.52473457007426,"Y":119.70704628977725},{"X":252.75404688913358,"Y":126.51101555433215},{"X":250.43609170574345,"Y":138.1007914712828},{"X":248.48397709021617,"Y":149.7563931861489},{"X":246.61664016401895,"Y":161.4272489748816},{"X":245.12579331582117,"Y":173.14911015760953},{"X":243.82057012194926,"Y":184.8961189024566},{"X":242.6355366230009,"Y":196.65481052398934},{"X":241.65399728994976,"Y":208.43328252060283},{"X":240.64291538462177,"Y":220.2091807691604},{"X":239.57284635805505,"Y":231.9799400613946},{"X":238.45352518909797,"Y":243.74599810902038},{"X":237.27746101105976,"Y":255.50663988940252},{"X":235.7228449364147,"Y":267.221335445097},{"X":234.05134368282657,"Y":278.9218442202139},{"X":230.7674337300107,"Y":290.2719753179636},{"X":226.77325192402432,"Y":301.3709598879444},{"X":222.03585439545412,"Y":312.1992970961049},{"X":215.6569968166831,"Y":322.14814384071514},{"X":208.11684249173953,"Y":331.16440750826047},{"X":198.96908127669263,"Y":338.58904908807665},{"X":187.81926971311617,"Y":342.28125},{"X":184,"Y":333.3434787496749},{"X":184,"Y":321.524180037935},{"X":185.30322641501823,"Y":309.95078249495344},{"X":189.6101711662547,"Y":298.9441459084602},{"X":194.39606281233856,"Y":288.1871557814922},{"X":200.9522301269852,"Y":278.35290480952216},{"X":207.50839744163193,"Y":268.51865383755216},{"X":215.300516175832,"Y":259.81309179368384},{"X":224.50081241050427,"Y":252.39349805604493},{"X":233.7011086451765,"Y":244.97390431840603},{"X":242.9790789521766,"Y":237.66288434599372},{"X":252.97216485456087,"Y":231.35146167080364},{"X":262.9652507569452,"Y":225.0400389956136},{"X":272.95833665932946,"Y":218.7286163204235},{"X":283.04726067846036,"Y":212.57836903262506},{"X":293.364840452307,"Y":206.81266268841665},{"X":303.6824202261537,"Y":201.04695634420824},{"X":314,"Y":195.28125}],"comments":"打开手势管理界面"}]'
dr.ParseInGestures(default_gestures)
export default dr;