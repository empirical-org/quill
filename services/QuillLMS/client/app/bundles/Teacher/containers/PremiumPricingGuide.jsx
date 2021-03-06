import React from 'react';

import QuestionsAndAnswers from './QuestionsAndAnswers.tsx'

import PremiumPricingMinisRow from '../components/premium/premium_pricing_minis_row.jsx';
import SubscriberLogos from '../components/premium/subscriber_logos.jsx';
import SchoolPremium from '../components/premium/school_premium.jsx';
import PremiumFeaturesTable from '../components/premium/premium_features_table.tsx'

const subscribers = [
   { name: 'Achievement first school logo', source: '/images/subscribers/1_achievement.png', id: 'achievement-first'},
   { name: 'KIPP: SF school logo', source: '/images/subscribers/2_kipp_sf.png', id: 'kipp-sf'},
   { name: 'KIPP: DC school logo', source: '/images/subscribers/3_kipp_dc.png', id: 'kipp-dc'},
   { name: 'KIPP: LA school logo', source: '/images/subscribers/4_kipp_la.png', id: 'kipp-la'},
   { name: 'Rocketship school logo', source: '/images/subscribers/5_kipp_rocketship.png', id: 'rocketship'},
   { name: 'Houston Independent School District logo', source: '/images/subscribers/6_houston.png', id: 'houston'},
   { name: 'Des Moines Public Schools logo', source: '/images/subscribers/7_desmoines.png', id: 'desmoines'},
   { name: 'Richmond Virginia Public Schools logo', source: '/images/subscribers/8_richmond.png', id: 'richmond'},
   { name: 'Putnam County Board of Education logo', source: '/images/subscribers/9_putnam.png', id: 'putnam'},
   { name: 'Elizabeth Public Schools logo', source: '/images/subscribers/10_elizabeth.png', id: 'elizabeth'},
   { name: 'North Thurston Public Schools logo', source: '/images/subscribers/11_thurston.png', id: 'thurston'},
   { name: 'Lead Public Schools logo', source: '/images/subscribers/12_lead.png', id: 'lead'},
   { name: 'Trinity Episcopal School logo', source: '/images/subscribers/13_trinity.png', id: 'trinity'},
   { name: 'Kuemper school logo', source: '/images/subscribers/14_kuemper.png', id: 'kuemper'},
   { name: 'Jordan School District logo', source: '/images/subscribers/15_jodan.png', id: 'jordan'},
   { name: 'Princeton Public Schools logo', source: '/images/subscribers/16_princeton.png', id: 'princeton'}
 ]

const PremiumPricingGuide = (props) => {
  // const size = useWindowSize();
  // const onMobile = () => size.width <= MAX_VIEW_WIDTH_FOR_MOBILE
  //
  const { diagnosticActivityCount, lessonsActivityCount, independentPracticeActivityCount, } = props
  return (
    <div>
      <div className="container premium-page">
        <div className="overview text-center">
          <div className="header">
            <h1>Compare plan features</h1>
            <p>Pick a plan that suits your needs.</p>
          </div>
          <PremiumPricingMinisRow {...props} />
          <PremiumFeaturesTable
            diagnosticActivityCount={diagnosticActivityCount}
            independentPracticeActivityCount={independentPracticeActivityCount}
            lessonsActivityCount={lessonsActivityCount}
          />
        </div>

        <div className="features text-center">
          <SchoolPremium />
          <SubscriberLogos subscribers={subscribers} />
        </div>
        <QuestionsAndAnswers
          questionsAndAnswersFile="premium"
          supportLink="https://support.quill.org/quill-premium"
        />
      </div>
    </div>
  );
}

export default PremiumPricingGuide
