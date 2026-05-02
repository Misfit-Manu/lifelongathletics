import os
import json

base_dir = r'C:\Users\Manu\Downloads\lifelong athletics\lifelongathletics.com\src\content\ace'
data_dir = r'C:\Users\Manu\Downloads\lifelong athletics\lifelongathletics.com\src\data'

os.makedirs(base_dir, exist_ok=True)
os.makedirs(data_dir, exist_ok=True)

chapters = [
    (1, 'Role and Scope of Practice for personal trainer'),
    (2, 'The ACE Integrated with IFT Model (intro)'),
    (3, 'Basics of behaviour Change'),
    (4, 'Effective communication, goal setting and teaching techniques'),
    (5, 'preParticipation Health Screening'),
    (6, 'Nutrition for health and fitness'),
    (7, 'Resting Assessments and Anthropometric measurements'),
    (8, 'Cardio Respiratory Training: Physiology, Assessments, and Programming'),
    (9, 'Muscular Training: Foundations and Benefits'),
    (10, 'Muscular Training: Assessments'),
    (11, 'Integrated Exercise Programing: from Evidence to Practice'),
    (12, 'Considerations for Clients with Obesity'),
    (13, 'Considerations for Clients with Chronic Disease'),
    (14, 'Exercise Considerations Across the Lifespan'),
    (15, 'Considerations for Clients with Musculoskeletal Issues'),
    (16, 'Legal Guidelines and Business Considerations'),
    (17, 'Misc: Anatomy and target exercises')
]

for ch_num, title in chapters:
    filename = f'chapter-{ch_num}.md'
    filepath = os.path.join(base_dir, filename)
    content = f'''---
title: "{title}"
chapter: {ch_num}
description: "Theory, Mindmaps, and Quiz for Chapter {ch_num}"
---

Welcome to **Chapter {ch_num}: {title}**. 

This is the theory section. You can edit this file (`src/content/ace/chapter-{ch_num}.md`) to add your actual study notes, embed YouTube videos, or add images. 

### Key Concepts to Remember:
- Point 1
- Point 2
- Point 3
'''
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Create dummy quiz data
quiz_data = {
    'chapter-1': [
        {
            'question': 'What is the primary purpose of the ACE Personal Trainer Certification?',
            'options': [
                'To diagnose medical conditions',
                'To prescribe meal plans',
                'To protect the public from harm',
                'To guarantee client weight loss'
            ],
            'answerIndex': 2,
            'explanation': 'Certifications in the healthcare and fitness industries are designed primarily to protect the public from harm by assessing the competence of practitioners.'
        },
        {
            'question': 'Which of the following is OUTSIDE the scope of practice for a Personal Trainer?',
            'options': [
                'Designing an exercise program',
                'Providing general nutrition guidelines',
                'Rehabilitating a knee injury',
                'Conducting fitness assessments'
            ],
            'answerIndex': 2,
            'explanation': 'Rehabilitating injuries is the job of a physical therapist. Personal trainers only work with apparently healthy individuals or those cleared for exercise by a physician.'
        }
    ]
}

with open(os.path.join(data_dir, 'ace-quizzes.json'), 'w', encoding='utf-8') as f:
    json.dump(quiz_data, f, indent=2)

print('Successfully generated chapters and quiz JSON.')
